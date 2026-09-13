from fastapi import FastAPI
from pydantic import BaseModel

from app.rag.chain import generate_answer
from app.rag.vector_store import store_document

app = FastAPI(
    title="Nexus RAG Service"
)


class QuestionRequest(BaseModel):
    question: str

class IngestRequest(BaseModel):
    file_path: str

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

@app.post("/ingest")
def ingest_document(request: IngestRequest):

    try:

        result = store_document(
            request.file_path
        )

        return {
            "success": True,
            "message": "Document added to Nexus knowledge base.",
            "filename": result["filename"],
            "characters": result["characters"],
            "chunks": result["chunks"]
        }

    except Exception as error:

        print(
            "Document ingestion error:",
            error
        )

        return {
            "success": False,
            "message": "Document ingestion failed.",
            "error": str(error)
        }