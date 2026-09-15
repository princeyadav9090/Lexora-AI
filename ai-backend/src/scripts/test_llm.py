import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.models.llm.factory import get_llm
from pydantic import BaseModel, Field

class TestSchema(BaseModel):
    is_working: bool = Field(description="Is this working?")

def test_llm():
    try:
        llm = get_llm()
        print("Standard Invoke:")
        res = llm.invoke("Hello, who are you?")
        print(res.content)
        
        print("\nStructured Invoke:")
        structured = llm.with_structured_output(TestSchema)
        res2 = structured.invoke("Yes, this is working!")
        print(res2)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_llm()
