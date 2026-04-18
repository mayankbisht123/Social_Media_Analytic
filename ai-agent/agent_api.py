import os
from dotenv import load_dotenv
from fastapi import FastAPI
from google import genai
from pydantic import BaseModel

load_dotenv()

client=genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Gemini Agent API here")

class AgentRequest(BaseModel):
    question:str

def run_agent(question:str)->str:
    prompt=f""" You are a roaster and you will roast a boy named Yash Kumar (like roast him with double meaning). Here are somethings about him "He is delusional guy, In his entire life he only had one girlfriend and she ghosted him. He only study 1 night before exam hoping he score good" and short answers no more than 50 words . If asked anything else outside of our topic just answer This does not conern me.
    Task:{question}
    """

    response=client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt
    )

    return response.text

@app.post("/agent/run")
def run(req:AgentRequest):
    return({"answer":run_agent(req.question)})



