import os
import redis
import json
import requests

from fastapi import FastAPI,Header,HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from fastapi.middleware.cors import CORSMiddleware

# ------------------
# CONFIG
# ------------------

load_dotenv()

NODE_SUMMARY_URL="http://localhost:4000/api/redditData/reddit/agent/summary"

GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")

MAX_HISTORY=10
SESSION_TTL=60*60
MAX_ITERATIONS=5


# ------------------
# INIT
# ------------------


client=genai.Client(api_key=GEMINI_API_KEY)
app=FastAPI(title="Ai agent with tools")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)

# ------------------
# REQUEST MODEL
# ------------------

class AgentRequest(BaseModel):
    question:str


# ------------------
# REDIS HELPERS
# ------------------

def get_chat_key(user_id:str)->str:
    return f"chat:{user_id}"


def get_session_history(user_id:str)->list:
    key=get_chat_key(user_id)
    messages=redis_client.lrange(key,0,-1)
    return [json.loads(m) for m in messages]

def append_to_history(user_id:str,messages:list):
    key=get_chat_key(user_id)
    messages=[json.dumps(m) for m in messages]
    redis_client.rpush(key,*messages)
    redis_client.ltrim(key,-MAX_HISTORY,-1)
    redis_client.expire(key,SESSION_TTL)




# ------------------
# TOOL SYSTEM
# ------------------


class RedditSummaryTool:
    name="reddit_summary_tool"
    description="Fetch monthly Reddit data analytics for authenticated user"

    def run(self,jwtToken:str):
        try:
            res=requests.get(NODE_SUMMARY_URL,headers={'Authorization':f"Bearer {jwtToken}"},timeout=20)
        except requests.RequestException:
            return "Error: Node Backend not reachable"

        if not res.ok:
            return "Error:Fetch to fail summary"
        
        data=res.json()
        return data.get("summary",{})
    
TOOLS={"reddit_summary_tool":RedditSummaryTool()}



# def build_system_propmt():
#     tool_descriptions="\n".join(
#         [f"{tool.name}:{tool.description}" for tool in TOOLS.values()]
#     )

#     return f"""
#     You are an autonomous Reddit Analytics Agent.

#     You can think, use tools, observe results, and then answer.

#     AVAILABLE TOOLS:
#     {tool_descriptions}

#     Follow this exact format:

#     Thought: describe your reasoning
#     Action: tool_name (or NONE if no tool needed)
#     Action Input: input for tool (or NONE)
#     Observation: result of tool (only after tool call)
#     ...
#     Final Answer: your final analytical answer

#     Rules:
#     - Always fetch data using reddit_summary_tool before answering analytics questions.
#     - Be analytical and data-driven.
#     - If user requests a table, output clean markdown table.
#     """


# ------------------
# AGENT CORE
# ------------------

def run_agent_loop(question: str, jwtToken: str, history: list):
    # 1. Initialize the conversation with existing history
    # We map Redis history (dicts) to the format Gemini expects
    contents = []
    
    for msg in history:
        # Simple text mapping for history
        contents.append(types.Content(
            role=msg["role"],
            parts=[types.Part.from_text(text=msg["content"])]
        ))

    # 2. Add the current user question
    contents.append(types.Content(
        role="user",
        parts=[types.Part.from_text(text=question)]
    ))

    # 3. Define the Tool Configuration
    # We define this once to pass to the model
    tool_config = types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="reddit_summary_tool",
                description="Fetch monthly Reddit data analytics for authenticated user",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={} # No params needed for this specific tool
                )
            )
        ]
    )

    # 4. The ReAct Loop
    for _ in range(MAX_ITERATIONS):
        
        # Call Gemini
        response = client.models.generate_content(
            model="gemini-flash-latest", # Updated to a model that supports tools well
            contents=contents,
            config=types.GenerateContentConfig(
                tools=[tool_config], 
                system_instruction="You are a Reddit analytics agent. Always call reddit_summary_tool before answering. Be data-driven."
            )
        )

        # Get the response content
        response_content = response.candidates[0].content
        model_part = response_content.parts[0]

        # -------------------------
        # CHECK: IS IT A TOOL CALL?
        # -------------------------
        if model_part.function_call:
            fn = model_part.function_call
            print(f"Agent is calling tool: {fn.name}")

            # A. Append the model's *intent* to call the tool to history
            # This is crucial: The model needs to remember it asked for this.
            contents.append(response_content)

            # B. Execute the tool
            tool_result = {}
            if fn.name == "reddit_summary_tool":
                tool_result = TOOLS["reddit_summary_tool"].run(jwtToken)
            else:
                tool_result = {"error": f"Unknown tool: {fn.name}"}

            # C. Create the Function Response Object
            # This is the specific format Gemini needs to "close the loop"
            function_response_part = types.Part.from_function_response(
                name=fn.name,
                response={"result": tool_result}
            )

            # D. Append the actual result to history
            contents.append(types.Content(
                role="user", # In Gemini, tool outputs are sent back as 'user' role
                parts=[function_response_part]
            ))

            # Loop continues -> Model sees the result -> Generates text answer
            continue

        # -------------------------
        # CHECK: IS IT TEXT? (Final Answer)
        # -------------------------
        if model_part.text:
            return model_part.text

    return "Agent has stopped working due to max iterations."





@app.post("/agent/run")
def run_agent(req:AgentRequest,authorization:str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401,detail="Missing authorization Toekn")
    
    jwtToken=authorization.split(" ",1)[1].strip()

    if not jwtToken:
        raise HTTPException(status_code=401,detail="Invalid Token")
    
    try:
        res=requests.get(NODE_SUMMARY_URL,headers={"Authorization":f"Bearer {jwtToken}"},timeout=20)
        data=res.json()
        user_id=data["userId"]
    
    except:
        raise HTTPException(status_code=500,detail="Unable to retrieve id from Node")
    
    history=get_session_history(user_id)
    answer=run_agent_loop(req.question,jwtToken,history)

    append_to_history(user_id,[
        {"role":"user","content":req.question},
        {"role":"assistant","content":answer}
    ])

    return {"assistant":answer}







