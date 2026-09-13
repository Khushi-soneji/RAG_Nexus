import pdfplumber
import os
import psycopg2
from dotenv import load_dotenv
from datetime import date, datetime

load_dotenv(
    os.path.join(
        os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        ),
        ".env"
    )
)


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

PDF_PATH = os.path.join(
    BASE_DIR,
    "documents",
    "ACADEMIC-CALENDAR-2026 - odd semesters (1).pdf"
)

def connect_database():

    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def save_holidays(holidays):

    connection = connect_database()
    cursor = connection.cursor()

    for holiday in holidays:

        print(
            f"Saving: {holiday['name']} | "
            f"{holiday['date']}"
        )

        date_text = holiday["date"].replace(" ", "")

        if "to" in date_text:

            start_text, end_text = date_text.split("to")

            start_date = datetime.strptime(
                start_text,
                "%d-%m-%Y"
            ).date()

            end_date = datetime.strptime(
                end_text,
                "%d-%m-%Y"
            ).date()

        else:

            start_date = datetime.strptime(
                date_text,
                "%d-%m-%Y"
            ).date()

            end_date = start_date

        cursor.execute(
            """
            INSERT INTO holidays
            (holiday_date, end_date, holiday_name, holiday_type)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (holiday_date)
            DO UPDATE SET
                end_date = EXCLUDED.end_date,
                holiday_name = EXCLUDED.holiday_name,
                holiday_type = EXCLUDED.holiday_type
            """,
            (
                start_date,
                end_date,
                holiday["name"],
                "Holiday"
            )
        )

    connection.commit()

    cursor.close()
    connection.close()

    print("\nAll holidays saved successfully!")


def extract_holidays():

    print("Reading academic calendar...\n")

    holidays = []

    with pdfplumber.open(PDF_PATH) as pdf:

        page = pdf.pages[0]

        tables = page.extract_tables()

        if not tables:
            print("No table found.")
            return

        table = tables[0]

        for row in table:

            if len(row) < 14:
                continue

            sr_no = row[10]
            holiday_name = row[11]
            date = row[12]
            day = row[13]

            # Skip header
            if sr_no == "Sr. No.":
                continue

            # Only process numbered holiday rows
            if not sr_no or not sr_no.strip().isdigit():
                continue

            if not holiday_name or not date:
                continue

            holiday_name = holiday_name.strip()

            date = date.replace("\n", " ").strip()

            day = day.replace("\n", " ").strip() if day else ""

            holidays.append({
                "sr_no": sr_no.strip(),
                "name": holiday_name,
                "date": date,
                "day": day
            })

    print("Extracted holidays:\n")

    for holiday in holidays:

        print(
            f"{holiday['sr_no']}. "
            f"{holiday['name']} | "
            f"{holiday['date']} | "
            f"{holiday['day']}"
        )
    return holidays

if __name__ == "__main__":

    holidays = extract_holidays()

    save_holidays(holidays)