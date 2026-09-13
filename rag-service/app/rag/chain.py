import os

from google import genai
from dotenv import load_dotenv

from app.rag.retriever import retrieve_documents


# Load variables from .env
load_dotenv()

# Get Gemini API key
api_key = os.getenv("GEMINI_API_KEY")

# Create Gemini client
client = genai.Client(api_key=api_key)


def generate_answer(question):

    # 1. Retrieve relevant documents
    results = retrieve_documents(question)

    # 2. Combine retrieved documents into context
    context_parts = []

    for result in results:

        document = result["document"]
        source = result["metadata"]["source"]

        context_parts.append(
            f"Source: {source}\n"
            f"Content:\n{document}"
        )

    context = "\n\n".join(context_parts)

    # 3. Create the prompt
    prompt = f"""
You are Nexus, an AI assistant for college students.

Answer the student's question using ONLY the information
provided in the context below.

Answer the student's question using ONLY the information
provided in the context below.

Important:
- Pay close attention to semester names, dates, and academic terms.
- Do not assume that "semester" means odd or even unless the context or question clearly specifies it.
- If multiple possible answers are present and the question is ambiguous, clearly mention the ambiguity and provide the relevant dates.
- Do not choose an answer simply because it appears first in the context.

If the answer is not present in the context, say:

"I could not find this information in the available college documents."

Do not make up information.

At the end of your answer, provide the source in this format:

Source: <source name>

Context:
{context}

Student Question:
{question}

Answer:
"""

    # 4. Send prompt to Gemini
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text


if __name__ == "__main__":

    question = "When do classes start for the even semester?"

    answer = generate_answer(question)

    print("\nQuestion:")
    print(question)

    print("\nNexus Answer:")
    print(answer)