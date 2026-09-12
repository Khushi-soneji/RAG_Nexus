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
    r"^\s*(\d{1,2}):(\d{2})\s+to\s+(\d{1,2}):(\d{2})\s*$"
)


DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]


def is_timetable_row(row):

    if not row:
        return False

    first_cell = row[0]

    if not first_cell:
        return False

    return bool(
        TIME_PATTERN.match(
            str(first_cell).strip()
        )
    )


def parse_time_range(time_text):

    match = TIME_PATTERN.match(
        time_text.strip()
    )

    if not match:
        return None, None

    start_hour = int(match.group(1))
    start_minute = int(match.group(2))

    end_hour = int(match.group(3))
    end_minute = int(match.group(4))

    # Convert timetable afternoon times
    # into 24-hour format.

    if start_hour in [1, 2, 3, 4, 5]:
        start_hour += 12

    if end_hour in [1, 2, 3, 4, 5]:
        end_hour += 12

    start_time = (
        f"{start_hour:02d}:"
        f"{start_minute:02d}"
    )

    end_time = (
        f"{end_hour:02d}:"
        f"{end_minute:02d}"
    )

    return start_time, end_time


def clean_cell(cell):

    if not cell:
        return ""

    return str(cell).strip()


def parse_timetable_row(row):

    if not is_timetable_row(row):
        return []

    start_time, end_time = parse_time_range(
        clean_cell(row[0])
    )

    records = []

    for column_index, day in enumerate(DAYS, start=1):

        if column_index >= len(row):
            continue

        cell = clean_cell(
            row[column_index]
        )

        if not cell:
            continue

        records.append(
            {
                "day": day,
                "start_time": start_time,
                "end_time": end_time,
                "raw_subject": cell
            }
        )

    return records


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

                for row_index, row in enumerate(table):

                    records = parse_timetable_row(row)

                    if not records:
                        continue

                    print()
                    print(
                        f"ROW {row_index}"
                    )

                    for record in records:

                        print(
                            f"  "
                            f"{record['day']}: "
                            f"{record['start_time']} - "
                            f"{record['end_time']} | "
                            f"{record['raw_subject']}"
                        )