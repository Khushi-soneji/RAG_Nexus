from app.rag.vector_store import store_document


file_path = "documents/test_notice.txt"


result = store_document(file_path)


print("\n================================")
print("DOCUMENT INGESTION SUCCESSFUL")
print("================================")

print("File:", result["filename"])
print("Characters:", result["characters"])
print("Chunks:", result["chunks"])