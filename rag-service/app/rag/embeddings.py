from sentence_transformers import SentenceTransformer


# Load the embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embeddings(chunks):
    embeddings = model.encode(chunks)

    return embeddings


if __name__ == "__main__":
    from loader import load_pdf
    from splitter import split_text

    file_path = "documents/ACADEMIC-CALENDAR-2026 - odd semesters (1).pdf"

    # 1. Load PDF
    text = load_pdf(file_path)

    # 2. Split text
    chunks = split_text(text)

    # 3. Create embeddings
    embeddings = create_embeddings(chunks)

    print("Total chunks:", len(chunks))
    print("Embeddings created:", len(embeddings))
    print("Embedding size:", len(embeddings[0]))

    print("\nFirst embedding:")
    print(embeddings[0])