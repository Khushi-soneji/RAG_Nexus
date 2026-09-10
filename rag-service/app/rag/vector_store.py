import chromadb

from loader import load_pdf
from splitter import split_text
from embeddings import create_embeddings


# Create a persistent ChromaDB client
client = chromadb.PersistentClient(path="chroma_db")


# Create or get our collection
collection = client.get_or_create_collection(
    name="nexus_documents"
)


def store_documents(chunks, embeddings):

    ids = [f"chunk_{i}" for i in range(len(chunks))]

    # Metadata for each chunk
    metadatas = [
        {
            "source": "Academic Calendar 2026-27",
            "file": "ACADEMIC-CALENDAR-2026 - odd semesters (1).pdf"
        }
        for _ in chunks
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings.tolist(),
        metadatas=metadatas
    )

    print(f"Stored {len(chunks)} chunks in ChromaDB.")


if __name__ == "__main__":

    file_path = "documents/ACADEMIC-CALENDAR-2026 - odd semesters (1).pdf"

    # 1. Load PDF
    text = load_pdf(file_path)

    # 2. Split text
    chunks = split_text(text)

    # 3. Create embeddings
    embeddings = create_embeddings(chunks)

    # 4. Store everything in ChromaDB
    store_documents(chunks, embeddings)

    print("ChromaDB setup completed!")