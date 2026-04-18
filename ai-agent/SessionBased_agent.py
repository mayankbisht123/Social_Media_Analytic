import os
from dotenv import load_dotenv
from google import genai
from fastapi import FastAPI
from pydantic import BaseModel

load_dotenv()

client=genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
app=FastAPI(title="Session based agent")


session_memory={}
MAX_HISTORY=6

class AgentRequest(BaseModel):
    session_id:str
    question:str

def build_prompt(history:list,user_input:str)->str:
    prompt="You are a helpful assistance. Use the conversation below\n\n"

    for msg in history:
        prompt+= f"{msg}\n"
    
    prompt+=f"User :{user_input}\n Assistance:"
    return prompt

def run_agent(session_id:str,question:str)->str:
    history=session_memory.get(session_id,[])
    prompt=build_prompt(history,question)

    response=client.models.generate_content(
        model='gemini-flash-latest',
        contents=prompt
    )

    answer=response.text.strip()

    history.append(f"User:{question}")
    history.append(f"Assistance:{answer}")

    if(len(history)>MAX_HISTORY):
        history=history[-MAX_HISTORY]


    session_memory[session_id]=history
    return answer

@app.post("/agent/run")
def run(req:AgentRequest):
    return{
            "session_id":req.session_id,
            "answer":run_agent(req.session_id,req.question)
    }


