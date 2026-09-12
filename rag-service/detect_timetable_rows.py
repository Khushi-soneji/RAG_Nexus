import pdfplumber
import os
import re


PDF_FOLDER = "documents"


PDF_FILES = [
    "FINAL TIME TABLE FOR ODD SEM - SEM 1 FINAL.pdf",
    "FINAL TIME TABLE FOR ODD SEM - SEM 3.pdf",
    "FINAL TIME TABLE FOR ODD SEM - SEM 5.pdf",
    "Updated Schedule SEM 7.pdf"
]


TIME_PATTERN = re.compile(
    r"^\s*\d{1,2}:\d{2}\s+to\s+\d{1,2}:\d{2}\s*$"
)


def is_timetable_row(row):

    if not row:
        return False

    first_cell = row[0]

    if not first_cell:
        return False

    text = str(first_cell).strip()

    return bool(
        TIME_PATTERN.match(text)
    )


def inspect_table(table):

    timetable_rows = []

    for row_index, row in enumerate(table):

        if is_timetable_row(row):

            time_range = str(
                row[0]
            ).strip()

            timetable_rows.append(
                {
                    "row_index": row_index,
                    "time": time_range
                }
            )

    return timetable_rows


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
                f"\nPAGE {page_number}"
            )

            for table_number, table in enumerate(
                tables,
                start=1
            ):

                print(
                    f"\nTABLE {table_number}"
                )

                timetable_rows = inspect_table(
                    table
                )

                if not timetable_rows:

                    print(
                        "No timetable rows found."
                    )

                    continue

                print(
                    "Timetable rows:"
                )

                for item in timetable_rows:

                    print(
                        f"  Row "
                        f"{item['row_index']}: "
                        f"{item['time']}"
                    )