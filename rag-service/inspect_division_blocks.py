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


def is_division_header(cell):

    if not cell:
        return None

    text = str(cell).strip()

    first_line = text.split("\n")[0].strip()

    match = re.search(
        r"Semester\s+(\d+)\s+"
        r"(Integrated\s+)?Division\s+([A-Z])",
        first_line,
        re.IGNORECASE
    )

    if match:

        semester = int(match.group(1))

        integrated = match.group(2)

        division = match.group(3).upper()

        if integrated:
            division = "Integrated " + division

        return {
            "semester": semester,
            "division": division
        }

    return None


def detect_division_blocks(table):

    divisions = []

    current_division = None
    current_start = None

    for row_index, row in enumerate(table):

        first_cell = None

        if row and row[0]:
            first_cell = str(row[0]).strip()

        detected = is_division_header(first_cell)

        if detected:

            if (
                current_division is not None
                and detected["semester"]
                    == current_division["semester"]
                and detected["division"]
                    == current_division["division"]
            ):
                continue

            if current_division is not None:

                divisions.append({
                    "semester":
                        current_division["semester"],

                    "division":
                        current_division["division"],

                    "start_row":
                        current_start,

                    "end_row":
                        row_index - 1
                })

            current_division = detected
            current_start = row_index

    if current_division is not None:

        divisions.append({
            "semester":
            current_division["semester"],

            "division":
            current_division["division"],

            "start_row":
            current_start,

            "end_row":
            len(table) - 1
        })

    return divisions


def print_block(table, division):

    start = division["start_row"]
    end = division["end_row"]

    print()
    print("-" * 80)

    print(
        f"Semester {division['semester']} | "
        f"Division {division['division']}"
    )

    print(
        f"Rows {start} to {end}"
    )

    print("-" * 80)

    for row_index in range(start, end + 1):

        row = table[row_index]

        print()
        print(f"ROW {row_index}")

        for column_index, cell in enumerate(row):

            if cell is not None and str(cell).strip():

                text = str(cell).replace(
                    "\n",
                    " | "
                )

                print(
                    f"  Col {column_index}: "
                    f"{text}"
                )


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

            print()
            print(f"PAGE {page_number}")

            for table_number, table in enumerate(
                tables,
                start=1
            ):

                print()
                print(
                    f"TABLE {table_number}"
                )

                divisions = detect_division_blocks(
                    table
                )

                if not divisions:

                    print(
                        "No division blocks."
                    )

                    continue

                for division in divisions:

                    print_block(
                        table,
                        division
                    )