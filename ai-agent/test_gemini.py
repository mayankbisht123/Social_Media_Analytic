import os
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Create Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

#print("Listing available models...")
# The new SDK returns a simple object where .name is the model ID
#for m in client.models.list():
#    print(m.name)

response=client.models.generate_content(
	model="gemini-flash-latest",
	contents="Reply: tell me a joke"
)

print(response.text)
