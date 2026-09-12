from fastapi import FastAPI
from pydantic import BaseModel

from app.rag.chain import generate_answer


app = FastAPI(
    title="Nexus RAG Service"
)


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "Nexus RAG service is running!"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):

    answer = generate_answer(request.question)

    return {
        "success": True,
        "question": request.question,
        "answer": answer
    }