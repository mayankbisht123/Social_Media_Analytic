import os
import redis
import json
import requests

from fastapi import FastAPI,Header,HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

#---------
# CONFIG
#---------

GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")

# Grab live URLs from Render/Vercel, fall back to localhost for testing
NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:4000")
NODE_SUMMARY_URL = f"{NODE_BACKEND_URL}/api/redditData/reddit/agent/summary"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

MAX_HISTORY=6
SESSION_TTL=60*60 # 1hour

# ----
# INIT
# ---- 

app=FastAPI(title="redis based agent")
client=genai.Client(api_key=GEMINI_API_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],  # adjust if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Redis connection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)



# --------
# REDIS MODAL
# --------

class AgentRequest(BaseModel):
    question:str
    use_web_search: bool = False

# -----
# REDIS HELPER
# -----

def get_chat_key(user_id:str)->str:
    return f"chat:{user_id}"

def build_prompt(history: list, user_input: str, monthly_summary: list, use_web_search: bool) -> str:
    prompt = ("You are an Insight Agent for social media analytics.\n"
              "You will be given monthly analytics summary for Reddit.\n")
    
    # Strict behavior control based on the toggle
    if use_web_search:
        prompt += ("Web Search is ON. You may search the web for external information to supplement the data. "
                   "If you use web sources, explicitly mention them.\n")
    else:
        prompt += ("Web Search is OFF. Answer based ONLY on the provided analytics data. DO NOT GUESS. "
                   "If the question is not related to the topic or data is missing, tell the user straight 'No, I do not have data for that'.\n")

    prompt += ("\n=== ANALYTICS SUMMARY (monthly) ===\n"
               f"{json.dumps(monthly_summary, ensure_ascii=False)}\n\n"
               "=== CHAT HISTORY ===\n")

    for msg in history:
        prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"

    prompt += f"User: {user_input}\nAssistant:"
    return prompt



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



# ------
# Node
# ------



def get_node_data(jwt_token:str)->dict:
    try:
        res=requests.get(NODE_SUMMARY_URL,headers={"Authorization":f"Bearer {jwt_token}"},timeout=20)
    
    except requests.RequestException:
        raise HTTPException(status_code=503,detail="Node backend not rechable")
    
    if res.status_code==404:
        raise HTTPException(status_code=404,detail="User Not found")
    if not res.ok:
        raise HTTPException(status_code=500,detail="Node backend server not working properly")
    
    data=res.json()

    if "userId" not in data or 'summary' not in data:
        raise HTTPException(status_code=500,detail="Invalid payload")
    
    return data



# ----
# MAIN
# ----

@app.post("/agent/run")
def run_agent(req:AgentRequest,authorization:str=Header(None)):

    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401,detail="Missing authorization token")
    
    jwt_token=authorization.split(" ",1)[1].strip()
    if not jwt_token:
        raise HTTPException(status_code=404,detail="key not found")
    
    Node_data=get_node_data(jwt_token)
    user_id = Node_data['userId']
    monthly_summary= Node_data['summary']

    history=get_session_history(user_id)
    prompt=build_prompt(history,req.question,monthly_summary,req.use_web_search)

    config = types.GenerateContentConfig()
    if req.use_web_search:
        config.tools = [types.Tool(google_search=types.GoogleSearch())]
    

    response=client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config
    )

    answer=response.text.strip()

    if req.use_web_search and response.candidates and response.candidates[0].grounding_metadata:
        chunks = response.candidates[0].grounding_metadata.grounding_chunks
        sources = []
        if chunks:
            for chunk in chunks:
                if hasattr(chunk, 'web') and chunk.web and chunk.web.uri:
                    sources.append(f"- [{chunk.web.title}]({chunk.web.uri})")
            
            if sources:
                answer += "\n\n**Sources:**\n" + "\n".join(set(sources))

    
    append_to_history(
        user_id,
        [
            {"role":'user',"content":req.question},
            {"role":"assistant","content":answer}
        ]
    )

    return {'assistant':answer}




