import pdfplumber
import os


PDF_FOLDER = "documents"


PDF_FILES = [
    "FINAL TIME TABLE FOR ODD SEM - SEM 1 FINAL.pdf",
    "FINAL TIME TABLE FOR ODD SEM - SEM 3.pdf",
    "FINAL TIME TABLE FOR ODD SEM - SEM 5.pdf",
    "Updated Schedule SEM 7.pdf"
]


for pdf_name in PDF_FILES:

    pdf_path = os.path.join(
        PDF_FOLDER,
        pdf_name
    )

    print("\n")
    print("=" * 70)
    print("PDF:", pdf_name)
    print("=" * 70)

    with pdfplumber.open(pdf_path) as pdf:

        print("Total pages:", len(pdf.pages))

        for page_number, page in enumerate(pdf.pages, start=1):

            tables = page.extract_tables()

            print(
                f"\nPage {page_number}: "
                f"{len(tables)} table(s) found"
            )

            for table_number, table in enumerate(
                tables,
                start=1
            ):

                print(
                    f"  Table {table_number}: "
                    f"{len(table)} rows x "
                    f"{len(table[0]) if table else 0} columns"
                )

                # Print first few rows only
                for row in table[:5]:

                    print("   ", row)