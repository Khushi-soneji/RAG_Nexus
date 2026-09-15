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

    pages = load_document(file_path)

    print(
        "Pages extracted:",
        len(pages)
    )

    if not pages:

        raise ValueError(
            "No text could be extracted from the document."
        )


    # -------------------------------------
    # 2. Split text
    # -------------------------------------

    print("Splitting document...")

    chunks = split_text(pages)

    print(
        "Chunks created:",
        len(chunks)
    )


    if not chunks:

        raise ValueError(
            "No chunks were created from the document."
        )


    # -------------------------------------
    # 3. Extract chunk text
    # -------------------------------------

    chunk_texts = [
        chunk["text"]
        for chunk in chunks
    ]


    # -------------------------------------
    # 4. Create embeddings
    # -------------------------------------

    print("Creating embeddings...")

    embeddings = create_embeddings(
        chunk_texts
    )

    print("Embeddings created.")


    # -------------------------------------
    # 5. Document information
    # -------------------------------------

    filename = os.path.basename(
        file_path
    )


    # -------------------------------------
    # 6. Create unique IDs
    # -------------------------------------

    existing_count = collection.count()

    ids = [
        f"document_{existing_count + i}"
        for i in range(len(chunks))
    ]


    # -------------------------------------
    # 7. Metadata
    # -------------------------------------

    metadatas = [

        {
            "source": filename,
            "file": filename,
            "page": chunk["page"],
            "start_line": chunk["start_line"],
            "end_page": chunk["end_page"],
            "end_line": chunk["end_line"]
        }

        for chunk in chunks

    ]


    # -------------------------------------
    # 8. Store in ChromaDB
    # -------------------------------------

    collection.add(

        ids=ids,

        documents=chunk_texts,

        embeddings=embeddings.tolist(),

        metadatas=metadatas

    )


    print(
        f"Stored {len(chunks)} chunks in ChromaDB."
    )


    return {

        "filename": filename,

        "pages": len(pages),

        "chunks": len(chunks)

    }