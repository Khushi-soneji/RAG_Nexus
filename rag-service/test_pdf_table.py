import pdfplumber

pdf_file = "documents/FINAL TIME TABLE FOR ODD SEM - SEM 5.pdf"

with pdfplumber.open(pdf_file) as pdf:

    print("Total pages:", len(pdf.pages))

    page = pdf.pages[0]

    tables = page.extract_tables()

    print("Tables found:", len(tables))

    for i, table in enumerate(tables):

        print(f"\n========== TABLE {i + 1} ==========")
        print("Rows:", len(table))
        print("Columns:", len(table[0]) if table else 0)

        for row in table:
            print(row)