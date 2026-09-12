import pdfplumber
import os
import re
import json


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

    if not row[0]:
        return False

    return bool(
        TIME_PATTERN.match(
            str(row[0]).strip()
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


def extract_rows():

    all_records = []

    for pdf_name in PDF_FILES:

        pdf_path = os.path.join(
            PDF_FOLDER,
            pdf_name
        )

        print(
            f"\nProcessing: {pdf_name}"
        )

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

                    for row_index, row in enumerate(table):

                        if not is_timetable_row(row):
                            continue

                        start_time, end_time = parse_time_range(
                            clean_cell(row[0])
                        )

                        for column_index, day in enumerate(
                            DAYS,
                            start=1
                        ):

                            if column_index >= len(row):
                                continue

                            cell = clean_cell(
                                row[column_index]
                            )

                            if not cell:
                                continue

                            record = {
                                "pdf": pdf_name,
                                "page": page_number,
                                "table": table_number,
                                "row": row_index,
                                "day": day,
                                "start_time": start_time,
                                "end_time": end_time,
                                "raw_cell": cell
                            }

                            all_records.append(record)

    return all_records


records = extract_rows()


output_file = "timetable_raw.json"


with open(
    output_file,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        records,
        file,
        indent=4,
        ensure_ascii=False
    )


print()
print("=" * 80)
print("EXTRACTION COMPLETED")
print("=" * 80)

print(
    f"Total records extracted: {len(records)}"
)

print(
    f"Saved to: {output_file}"
)