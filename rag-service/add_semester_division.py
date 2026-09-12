import json
import os
import re

from distro import info
import pdfplumber


INPUT_FILE = "timetable_raw.json"
OUTPUT_FILE = "timetable_with_division.json"

PDF_FOLDER = "documents"

PDF_FILES = [
    "FINAL TIME TABLE FOR ODD SEM - SEM 1 FINAL.pdf",
    "FINAL TIME TABLE FOR ODD SEM - SEM 3.pdf",
    "FINAL TIME TABLE FOR ODD SEM - SEM 5.pdf",
    "Updated Schedule SEM 7.pdf"
]


TIME_PATTERN = re.compile(
    r"^\s*(\d{1,2}):(\d{2})\s+to\s+"
    r"(\d{1,2}):(\d{2})\s*$"
)


def detect_division(text):
    """
    Detect division from a PDF cell.

    Examples:
    Semester 1 Division A
    Semester 1 Integrated Division A
    Semester 5 Division B
    """

    if not text:
        return None

    text = str(text).strip()

    match = re.search(
        r"Semester\s+(\d+)\s+"
        r"(Integrated\s+)?Division\s+([A-Z])",
        text,
        re.IGNORECASE
    )

    if not match:
        return None

    semester = int(match.group(1))
    integrated = match.group(2)
    division = match.group(3).upper()

    if integrated:
        division = "Integrated " + division

    return {
        "semester": semester,
        "division": division
    }


def get_division_for_row(table, row_index, fallback_semester):
    """
    Find the latest division header before this timetable row.
    """

    current_division = None

    for i in range(row_index + 1):

        row = table[i]

        if not row:
            continue

        for cell in row:

            if not cell:
                continue

            detected = detect_division(cell)

            if detected:

                current_division = detected

    if current_division:
        return current_division

    return {
        "semester": fallback_semester,
        "division": None
    }


def get_semester_from_pdf(pdf_name):
    """
    Get semester from PDF filename.
    """

    if "SEM 1" in pdf_name.upper():
        return 1

    if "SEM 3" in pdf_name.upper():
        return 3

    if "SEM 5" in pdf_name.upper():
        return 5

    if "SEM 7" in pdf_name.upper():
        return 7

    return None


# ---------------------------------------------------------
# Load raw timetable
# ---------------------------------------------------------

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    records = json.load(file)


# ---------------------------------------------------------
# Build division lookup
# ---------------------------------------------------------

division_lookup = {}


for pdf_name in PDF_FILES:

    pdf_path = os.path.join(
        PDF_FOLDER,
        pdf_name
    )

    semester = get_semester_from_pdf(pdf_name)

    print()
    print("=" * 70)
    print("Processing:", pdf_name)
    print("=" * 70)

    with pdfplumber.open(pdf_path) as pdf:

        for page_number, page in enumerate(
            pdf.pages,
            start=1
        ):

            tables = page.extract_tables()

            for table_number, table in enumerate(
                tables,
                start=1
            ):

                current_division = None

                for row_index, row in enumerate(table):

                    # Check the entire row for a division header
                    detected = None

                    for cell in row:

                        detected = detect_division(cell)

                        if detected:
                            break

                    if detected:

                        current_division = detected

                    # Is this a timetable row?
                    if (
                        row
                        and row[0]
                        and TIME_PATTERN.match(
                            str(row[0]).strip()
                        )
                    ):

                        key = (
                            pdf_name,
                            page_number,
                            table_number,
                            row_index
                        )

                        division_lookup[key] = {
                            "semester": (
                                current_division["semester"]
                                if current_division
                                else semester
                            ),
                            "division": (
                                current_division["division"]
                                if current_division
                                else None
                            )
                        }


# ---------------------------------------------------------
# Attach semester + division
# ---------------------------------------------------------

updated_records = []


for record in records:

    updated = record.copy()

    key = (
        record["pdf"],
        record["page"],
        record["table"],
        record["row"]
    )

    if info:

        updated["semester"] = info["semester"]
        updated["division"] = info["division"]

    else:

        updated["semester"] = get_semester_from_pdf(
            record["pdf"]
        )

    # Sem 7 Table 2 is the Division B section
    # whose division header is not preserved by
    # pdfplumber extraction.
    if (
        record["pdf"] == "Updated Schedule SEM 7.pdf"
        and record["table"] == 2
    ):
        updated["division"] = "B"

    else:
        updated["division"] = None

    updated_records.append(updated)


# ---------------------------------------------------------
# Save output
# ---------------------------------------------------------

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        updated_records,
        file,
        indent=4,
        ensure_ascii=False
    )


# ---------------------------------------------------------
# Statistics
# ---------------------------------------------------------

division_counts = {}

missing_division = 0


for record in updated_records:

    division = record["division"]

    if division is None:

        missing_division += 1

    else:

        division_counts[division] = (
            division_counts.get(division, 0) + 1
        )


print()
print("=" * 80)
print("SEMESTER + DIVISION ATTACHMENT COMPLETED")
print("=" * 80)

print(
    f"Total records: {len(updated_records)}"
)

print()
print("Division counts:")

for division, count in sorted(
    division_counts.items()
):

    print(
        f"  {division}: {count}"
    )

print()
print(
    f"Records without division: "
    f"{missing_division}"
)

print()
print(
    f"Saved to: {OUTPUT_FILE}"
)