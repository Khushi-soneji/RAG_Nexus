import chromadb
import re

from app.rag.embeddings import model


# Connect to existing ChromaDB
client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_collection(
    name="nexus_documents"
)


def retrieve_documents(question, top_k=3):

    # 1. Create embedding for the question
    question_embedding = model.encode([question])[0]

    # 2. Retrieve more candidates
    results = collection.query(
        query_embeddings=[question_embedding.tolist()],
        n_results=10
    )

    documents = results["documents"][0]
    distances = results["distances"][0]
    metadatas = results["metadatas"][0]

    # 3. Extract important words
    question_words = re.findall(
        r"\b[a-zA-Z]{3,}\b",
        question.lower()
    )

    scored_results = []

    for document, distance, metadata in zip(
        documents,
        distances,
        metadatas
    ):

        document_lower = document.lower()

        keyword_matches = 0

        for word in question_words:
            if word in document_lower:
                keyword_matches += 1

        # Extra importance for exact phrase matches
        phrase_bonus = 0

        if "even semester" in question.lower():
            if "even semester" in document_lower:
                phrase_bonus += 0.5

        if "odd semester" in question.lower():
            if "odd semester" in document_lower:
                phrase_bonus += 0.5

        semantic_score = 1 / (1 + distance)

        final_score = (
            semantic_score
            + (keyword_matches * 0.1)
            + phrase_bonus
        )

        scored_results.append(
            {
                "document": document,
                "distance": distance,
                "keyword_matches": keyword_matches,
                "score": final_score,
                "metadata": metadata
            }
        )

    scored_results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return scored_results[:top_k]


if __name__ == "__main__":

    question = "When do classes start for the even semester?"

    results = retrieve_documents(question)

    print("\nQuestion:")
    print(question)

    print("\nRetrieved documents:")

    for i, result in enumerate(results):

        print(f"\n--- Result {i + 1} ---")

        print("Semantic distance:", result["distance"])
        print("Keyword matches:", result["keyword_matches"])
        print("Final score:", result["score"])

        print("Source:", result["metadata"]["source"])
        print("File:", result["metadata"]["file"])
        print("Page:", result["metadata"]["page"])
        print("Start line:", result["metadata"]["start_line"])
        print("End page:", result["metadata"]["end_page"])
        print("End line:", result["metadata"]["end_line"])

        print("\nDocument:")
        print(result["document"])