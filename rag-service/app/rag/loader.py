from pypdf import PdfReader


def load_pdf(file_path):
    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


if __name__ == "__main__":
    file_path = "documents/ACADEMIC-CALENDAR-2026 - odd semesters (1).pdf"

    text = load_pdf(file_path)

    print("PDF loaded successfully!")
    print("Characters extracted:", len(text))

    print("\n--- First 2000 characters ---\n")
    print(text[:2000])