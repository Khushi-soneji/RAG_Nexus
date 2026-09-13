import os
import chromadb

from app.rag.loader import load_document
from app.rag.splitter import split_text
from app.rag.embeddings import create_embeddings


# =========================================
# CHROMADB
# =========================================

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="nexus_documents"
)


# =========================================
# STORE DOCUMENT
# =========================================

def store_document(file_path):

    # -------------------------------------
    # 1. Extract text
    # -------------------------------------

    print("Loading document...")

    text = load_document(file_path)

    print(
        "Characters extracted:",
        len(text)
    )


    if not text.strip():

        raise ValueError(
            "No text could be extracted from the document."
        )


    # -------------------------------------
    # 2. Split text
    # -------------------------------------

    print("Splitting document...")

    chunks = split_text(text)

    print(
        "Chunks created:",
        len(chunks)
    )


    # -------------------------------------
    # 3. Create embeddings
    # -------------------------------------

    print("Creating embeddings...")

    embeddings = create_embeddings(
        chunks
    )

    print("Embeddings created.")


    # -------------------------------------
    # 4. Document information
    # -------------------------------------

    filename = os.path.basename(
        file_path
    )


    # -------------------------------------
    # 5. Create unique IDs
    # -------------------------------------

    existing_count = collection.count()

    ids = [
        f"document_{existing_count + i}"
        for i in range(len(chunks))
    ]


    # -------------------------------------
    # 6. Metadata
    # -------------------------------------

    metadatas = [

        {
            "source": filename,
            "file": filename
        }

        for _ in chunks

    ]


    # -------------------------------------
    # 7. Store in ChromaDB
    # -------------------------------------

    collection.add(

        ids=ids,

        documents=chunks,

        embeddings=embeddings.tolist(),

        metadatas=metadatas

    )


    print(
        f"Stored {len(chunks)} chunks in ChromaDB."
    )


    return {

        "filename": filename,

        "characters": len(text),

        "chunks": len(chunks)

    }