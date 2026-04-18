import os
import redis
import json
import requests

from fastapi import FastAPI,Header,HTTPException
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

#---------
# CONFIG
#---------

GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")
NODE_SUMMARY_URL="http://localhost:4000/api/redditData/reddit/agent/summary"
MAX_HISTORY=6
SESSION_TTL=60*60 # 1hour

# ----
# INIT
# ---- 

app=FastAPI(title="redis based agent")
client=genai.Client(api_key=GEMINI_API_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # adjust if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client=redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)



# --------
# REDIS MODAL
# --------

class AgentRequest(BaseModel):
    question:str

# -----
# REDIS HELPER
# -----

def get_chat_key(user_id:str)->str:
    return f"chat:{user_id}"

def build_prompt(history:list,user_input:str,monthly_summary:list)->str:
    prompt=("You are Insight Agent for social media analytics.\n"
        "You will be given monthly analytics summary for Reddit.\n"
        "Answer based ONLY on the analytics data.\n"
        "If user requests a table, output a clean markdown table.\n"
        "Be specific and analytical.\n\n"
        "=== ANALYTICS SUMMARY (monthly) ===\n"
        f"{json.dumps(monthly_summary, ensure_ascii=False)}\n\n"
        "=== CHAT HISTORY ===\n")

    for msg in history:
        prompt +=f"{msg['role'].capitalize()}:{msg['content']}\n"

    prompt+=f"User: {user_input}\nAssistant:"

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

    prompt=build_prompt(history,req.question,monthly_summary)

    response=client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt
    )

    answer=response.text.strip()
    append_to_history(
        user_id,
        [
            {"role":'user',"content":req.question},
            {"role":"assistant","content":answer}
        ]
    )

    return {'assistant':answer}




