import os
from pypdf import PdfReader
from docx import Document


def load_pdf(file_path):
    reader = PdfReader(file_path)
    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        page_text = page.extract_text()

        if page_text:
            lines = page_text.splitlines()

            pages.append({
                "page": page_number,
                "lines": lines
            })

    return pages


def load_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        text = file.read()

    return [{
        "page": 1,
        "lines": text.splitlines()
    }]


def load_docx(file_path):
    document = Document(file_path)

    lines = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            lines.append(paragraph.text)

    return [{
        "page": 1,
        "lines": lines
    }]


def load_document(file_path):
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return load_pdf(file_path)

    elif extension == ".txt":
        return load_txt(file_path)

    elif extension == ".docx":
        return load_docx(file_path)

    else:
        raise ValueError(f"Unsupported file type: {extension}")