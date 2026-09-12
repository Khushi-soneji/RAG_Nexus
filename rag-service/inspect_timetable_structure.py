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
    print("=" * 80)
    print("PDF:", pdf_name)
    print("=" * 80)

    with pdfplumber.open(pdf_path) as pdf:

        for page_number, page in enumerate(
            pdf.pages,
            start=1
        ):

            tables = page.extract_tables()

            print(
                f"\n--- PAGE {page_number} ---"
            )

            for table_number, table in enumerate(
                tables,
                start=1
            ):

                print(
                    f"\nTABLE {table_number}"
                )

                print(
                    f"Rows: {len(table)}"
                )

                print(
                    f"Columns: "
                    f"{len(table[0]) if table else 0}"
                )

                print("\nRows:")

                for row_number, row in enumerate(table):

                    print(
                        f"\nRow {row_number}:"
                    )

                    for column_number, cell in enumerate(row):

                        if cell is not None and str(cell).strip():

                            print(
                                f"  Col {column_number}: "
                                f"{repr(cell)}"
                            )