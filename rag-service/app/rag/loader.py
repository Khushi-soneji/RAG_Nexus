import os

from pypdf import PdfReader
from docx import Document


def load_pdf(file_path):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


def load_txt(file_path):

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:

        text = file.read()

    return text


def load_docx(file_path):

    document = Document(file_path)

    text = ""

    for paragraph in document.paragraphs:

        if paragraph.text.strip():

            text += paragraph.text + "\n"

    return text


def load_document(file_path):

    extension = os.path.splitext(
        file_path
    )[1].lower()

    if extension == ".pdf":

        return load_pdf(file_path)

    elif extension == ".txt":

        return load_txt(file_path)

    elif extension == ".docx":

        return load_docx(file_path)

    else:

        raise ValueError(
            f"Unsupported file type: {extension}"
        )