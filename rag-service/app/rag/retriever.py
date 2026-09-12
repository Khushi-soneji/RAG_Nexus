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

    # 2. Retrieve candidates from ChromaDB
    results = collection.query(
        query_embeddings=[question_embedding.tolist()],
        n_results=6
    )

    documents = results["documents"][0]
    distances = results["distances"][0]
    metadatas = results["metadatas"][0]

    # 3. Extract important words from the question
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

        # Count keyword matches
        keyword_matches = 0

        for word in question_words:

            if word in document_lower:
                keyword_matches += 1

        # Convert distance into similarity score
        semantic_score = 1 / (1 + distance)

        # Combine semantic similarity + keyword matching
        final_score = semantic_score + (keyword_matches * 0.1)

        scored_results.append(
            {
                "document": document,
                "distance": distance,
                "keyword_matches": keyword_matches,
                "score": final_score,
                "metadata": metadata
            }
        )

    # 4. Sort by final score
    scored_results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # 5. Return best results
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

        print("\nDocument:")
        print(result["document"])