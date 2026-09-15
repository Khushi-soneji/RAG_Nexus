import os
import re

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

    if not results:
        return "I could not find this information in the available college documents."

    # 2. Prepare context
    context_parts = []

    for result in results:
        document = result["document"]
        source = result["metadata"]["source"]
        page = result["metadata"]["page"]
        start_line = result["metadata"]["start_line"]
        end_page = result["metadata"]["end_page"]
        end_line = result["metadata"]["end_line"]

        context_parts.append(
            f"Source: {source}\n"
            f"Pages: {page}-{end_page}\n"
            f"Lines: {start_line}-{end_line}\n"
            f"Content:\n{document}"
        )

    context = "\n\n".join(context_parts)

    # 3. Create prompt
    prompt = f"""
You are an AI assistant for college students.

Answer the student's question using ONLY the information
provided in the context below.

Rules:
1. Do not make up information.
2. If the answer is not present in the context, say:
"I could not find this information in the available college documents."
3. Give a clear and concise answer.
4. Pay close attention to semester names, dates, and academic terms.
5. Do not assume that "semester" means odd or even unless the question
   or context clearly specifies it.
6. If the question is ambiguous, explain the ambiguity and provide
   the relevant information.
7. Do not add a Source line yourself.

Context:
{context}

Student Question:
{question}

Answer:
"""

    # 4. Try Gemini
    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        answer = response.text.strip()

        if not answer.startswith(
            "I could not find this information"
        ):
            metadata = results[0]["metadata"]
            answer += (
                f"\n\nSource: {metadata['source']}"
                f"\nPages: {metadata['page']}-{metadata['end_page']}"
                f"\nLines: {metadata['start_line']}-{metadata['end_line']}"
            )
        return answer

    # 5. Gemini quota/error fallback
    except Exception as error:

        print("Gemini error:", error)

        document = results[0]["document"].strip()
        source = results[0]["metadata"]["source"]
        page = results[0]["metadata"]["page"]
        start_line = results[0]["metadata"]["start_line"]
        end_page = results[0]["metadata"]["end_page"]
        end_line = results[0]["metadata"]["end_line"]

        # --------------------------------------------------
        # SPECIAL FALLBACK FOR EVEN SEMESTER QUESTION
        # --------------------------------------------------

        if (
            "even semester" in question.lower()
            or "even semesters" in question.lower()
        ):

            match = re.search(
                r"(\d{1,2}/\d{1,2}/\d{4})\s+\*?commencement of Even Semesters",
                document,
                re.IGNORECASE
            )

            if match:

                date = match.group(1)

                return (
                    f"The Even Semester commences on {date}."
                    f"\n\nSource: {source}"
                    f"\nPages: {page}-{end_page}"
                    f"\nLines: {start_line}-{end_line}"
                )

        # --------------------------------------------------
        # GENERAL FALLBACK
        # --------------------------------------------------

        return (
    "Based on the available college document:\n\n"
    + document
    + f"\n\nSource: {source}"
    + f"\nPages: {page}-{end_page}"
    + f"\nLines: {start_line}-{end_line}"
)


if __name__ == "__main__":

    question = "When do classes start for the even semester?"

    answer = generate_answer(question)

    print("\nQuestion:")
    print(question)

    print("\nAI Assistant Answer:")
    print(answer)