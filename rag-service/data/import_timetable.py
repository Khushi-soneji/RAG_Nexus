import json
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".env"
    )
)

connection = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

cursor = connection.cursor()

json_file = os.path.join(
    os.path.dirname(__file__),
    "..",
    "timetable_final.json"
)

with open(json_file, "r", encoding="utf-8") as file:
    records = json.load(file)

print("Loaded records:", len(records))

cursor.execute("DELETE FROM timetable")
print("Existing timetable data cleared.")

count = 0

for record in records:

    semester = record.get("semester")
    division = record.get("division")
    day = record.get("day")
    start_time = record.get("start_time")
    end_time = record.get("end_time")

    for entry in record.get("entries", []):

        entry_type = entry.get("type")

        if entry_type == "class":

            cursor.execute(
                """
                INSERT INTO timetable
                (
                    semester,
                    division,
                    batch,
                    day,
                    start_time,
                    end_time,
                    subject_code,
                    subject,
                    faculty,
                    room,
                    class_type
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    semester,
                    division,
                    entry.get("batch"),
                    day,
                    start_time,
                    end_time,
                    entry.get("subject_code"),
                    entry.get("subject_name"),
                    entry.get("faculty_initials"),
                    entry.get("room"),
                    entry.get("class_type")
                )
            )

            count += 1

        elif entry_type == "activity":

            cursor.execute(
                """
                INSERT INTO timetable
                (
                    semester,
                    division,
                    batch,
                    day,
                    start_time,
                    end_time,
                    subject_code,
                    subject,
                    faculty,
                    room,
                    class_type
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    semester,
                    division,
                    None,
                    day,
                    start_time,
                    end_time,
                    None,
                    entry.get("activity"),
                    None,
                    None,
                    "Activity"
                )
            )

            count += 1

connection.commit()

cursor.close()
connection.close()

print("=" * 80)
print("TIMETABLE IMPORT COMPLETED")
print("=" * 80)
print("Rows imported:", count)