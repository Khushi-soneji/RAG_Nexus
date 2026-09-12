import pdfplumber


PDF_FILE = "documents/FINAL TIME TABLE FOR ODD SEM - SEM 5.pdf"


DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]


def extract_pdf_table():

    with pdfplumber.open(PDF_FILE) as pdf:

        page = pdf.pages[0]

        tables = page.extract_tables()

        if not tables:
            print("No table found!")
            return None

        return tables[0]


def split_cell(cell):

    if not cell:
        return []

    lines = cell.split("\n")

    entries = []

    current_entry = ""

    for line in lines:

        line = line.strip()

        if not line:
            continue

        # B1, B2 and B3 indicate separate batch activities
        if line.startswith(("B1 ", "B2 ", "B3 ")):

            if current_entry:
                entries.append(current_entry)

            current_entry = line

        else:

            if current_entry:
                current_entry += " " + line
            else:
                current_entry = line

    if current_entry:
        entries.append(current_entry)

    return entries
FACULTY_INITIALS = {
    "DM": "Prof. Drashti Makwana",
    "SG": "Ms. Shivangi Gandhi",
    "ADJ": "Dr. Aditi Joshi",
    "YP": "Ms. Yesha Patel",
    "MRC": "Dr. Madhuri Chopade",
    "RJ": "Ms. Richa Jadav",
    "AKJ": "Dr. Aakanksha Jain",
}

def parse_division_a(table, subject_mapping, track_subjects):

    timetable = []

    # Division A timetable = rows 3 to 10
    for row in table[3:11]:

        time_range = row[0]

        if not time_range:
            continue

        if "to" not in time_range:
            continue

        start_time, end_time = time_range.split(" to ")

        for day_index, day in enumerate(DAYS):

            cell = row[day_index + 1]

            entries = split_cell(cell)

            for entry in entries:

                if entry.upper() == "BREAK":
                    continue

                # Some cells contain multiple classes separated by /
                sub_entries = [
                    part.strip()
                    for part in entry.split("/")
                    if part.strip()
                ]

                for sub_entry in sub_entries:

                    parsed = parse_timetable_entry(
                        sub_entry,
                        subject_mapping,
                        track_subjects
                    )

                    if parsed is None:
                        continue

                    parsed["semester"] = 5
                    parsed["division"] = "A"
                    parsed["day"] = day
                    parsed["start_time"] = start_time
                    parsed["end_time"] = end_time

                    # Put timetable fields in a clean order
                    parsed = {
                        "semester": parsed["semester"],
                        "division": parsed["division"],
                        "day": parsed["day"],
                        "start_time": parsed["start_time"],
                        "end_time": parsed["end_time"],
                        "batch": parsed["batch"],
                        "subject_code": parsed["subject_code"],
                        "subject": parsed["subject"],
                        "faculty": parsed["faculty"],
                        "room": parsed["room"],
                        "class_type": parsed["class_type"]
                    }

                    timetable.append(parsed)

    return timetable

def extract_subject_reference(table):

    subjects = {}

    # Division A subject reference = rows 3 to 7
    for row in table[3:8]:

        subject_code = row[8]
        subject_name = row[9]
        faculty = row[10]

        if not subject_code or not subject_name:
            continue

        subject_code = str(subject_code).strip()

        # Remove line breaks and extra spaces
        subject_name = " ".join(
            str(subject_name).split()
        )

        if faculty:
            faculty = " ".join(
                str(faculty).split()
            )
        else:
            faculty = ""

        subjects[subject_code] = {
            "subject": subject_name,
            "faculty": faculty
        }

    return subjects


def build_subject_mapping(subjects):

    mapping = {}

    for code, details in subjects.items():

        subject_name = details["subject"]

        # Find abbreviation inside (...)
        start = subject_name.rfind("(")
        end = subject_name.rfind(")")

        if start == -1 or end == -1:
            continue

        abbreviation = subject_name[
            start + 1:end
        ].strip()

        mapping[abbreviation] = {
            "subject_code": code,
            "subject": subject_name,
            "faculty": details["faculty"]
        }

    return mapping

def parse_timetable_entry(entry, subject_mapping, track_subjects):

    entry = entry.strip()

    if not entry:
        return None

    batch = None
    room = None
    class_type = "Lecture"
    faculty_initials = None

    # -----------------------------------
    # 1. Detect batch
    # -----------------------------------

    if entry.startswith(("B1 ", "B2 ", "B3 ")):
        batch = entry[:2]
        entry = entry[3:].strip()

    # -----------------------------------
    # 2. Detect room written as (510)
    # -----------------------------------

    if "(" in entry and ")" in entry:

        start = entry.rfind("(")
        end = entry.rfind(")")

        room = entry[start + 1:end].strip()
        entry = entry[:start].strip()

    # -----------------------------------
    # 3. Detect laboratory
    # -----------------------------------

    if "LAB" in entry.upper():

        class_type = "Laboratory"

        parts = entry.split()

        if len(parts) >= 2:

            room = " ".join(parts[-2:])
            entry = " ".join(parts[:-2]).strip()

    # -----------------------------------
    # 4. Detect numeric room
    # -----------------------------------

    parts = entry.split()

    if room is None and parts:

        last_part = parts[-1]

        if last_part.isdigit():

            room = last_part
            entry = " ".join(parts[:-1]).strip()

    # -----------------------------------
    # 5. Identify subject
    # -----------------------------------

    parts = entry.split()

    if not parts:
        return None

    subject_details = None
    subject_text = None

    # -----------------------------------
    # 5A. Check exact subject abbreviation
    # -----------------------------------

    if parts[0] in subject_mapping:

        subject_text = parts[0]

        subject_details = subject_mapping[parts[0]]

        parts = parts[1:]

    # -----------------------------------
    # 5B. Check track subjects
    # -----------------------------------

    else:

        for code, details in track_subjects.items():

            subject_name = details["subject"]

            abbreviation_start = subject_name.rfind("(")
            abbreviation_end = subject_name.rfind(")")

            if (
                abbreviation_start != -1
                and abbreviation_end != -1
            ):

                abbreviation = subject_name[
                    abbreviation_start + 1:abbreviation_end
                ].strip()

                if parts[0] == abbreviation:

                    subject_text = parts[0]

                    subject_details = {
                        "subject_code": code,
                        "subject": subject_name,
                        "faculty": details["faculty"]
                    }

                    parts = parts[1:]

                    break

    # -----------------------------------
    # 5C. Handle Capstone I
    # -----------------------------------

    if subject_details is None:

        if len(parts) >= 2:

            if parts[0].lower() == "capstone" and parts[1].lower() == "i":

                subject_text = "Capstone I"

                parts = parts[2:]

    # -----------------------------------
    # 6. Detect faculty initials
    # -----------------------------------

    if parts:

        possible_faculty = parts[0]

        if possible_faculty in FACULTY_INITIALS:

            faculty_initials = possible_faculty
            parts = parts[1:]

        elif (
            len(possible_faculty) <= 4
            and possible_faculty.isalpha()
            and possible_faculty.upper() == possible_faculty
            and possible_faculty != "I"
        ):

            faculty_initials = possible_faculty
            parts = parts[1:]

    # -----------------------------------
    # 7. Resolve faculty
    # -----------------------------------

    faculty = None

    if faculty_initials in FACULTY_INITIALS:

        faculty = FACULTY_INITIALS[faculty_initials]

    elif subject_details:

        faculty = subject_details["faculty"]

    # -----------------------------------
    # 8. Known subject
    # -----------------------------------

    if subject_details is not None:

        return {
            "batch": batch,
            "subject_code": subject_details["subject_code"],
            "subject": subject_details["subject"],
            "faculty": faculty,
            "faculty_initials": faculty_initials,
            "room": room,
            "class_type": class_type
        }

    # -----------------------------------
    # 9. Unknown / special subject
    # -----------------------------------

    if subject_text is not None:

        return {
            "batch": batch,
            "subject_code": None,
            "subject": subject_text,
            "faculty": faculty,
            "faculty_initials": faculty_initials,
            "room": room,
            "class_type": class_type
        }

    # -----------------------------------
    # 10. Completely unknown entry
    # -----------------------------------

    return {
        "batch": batch,
        "subject_code": None,
        "subject": " ".join(
            [subject_text] if subject_text else []
        ),
        "faculty": faculty,
        "faculty_initials": faculty_initials,
        "room": room,
        "class_type": class_type
    }


def extract_track_subjects(table):

    track_subjects = {}

    # Track subject reference = rows 21 to 24 ONLY
    for row in table[21:25]:

        subject_code = row[8]
        subject_name = row[9]
        faculty = row[10]

        if not subject_code or not subject_name:
            continue

        subject_code = str(subject_code).strip()

        # Remove line breaks and extra spaces
        subject_name = " ".join(
            str(subject_name).split()
        )

        if faculty:
            faculty = " ".join(
                str(faculty).split()
            )
        else:
            faculty = ""

        track_subjects[subject_code] = {
            "subject": subject_name,
            "faculty": faculty
        }

    return track_subjects

if __name__ == "__main__":

    table = extract_pdf_table()

    if table:

        print("\n========== SUBJECT REFERENCE ==========")

        subjects = extract_subject_reference(table)

        for code, details in subjects.items():

            print(
                f"{code} | "
                f"{details['subject']} | "
                f"{details['faculty']}"
            )

        print("\n========== SUBJECT MAPPING ==========")

        mapping = build_subject_mapping(subjects)

        for abbreviation, details in mapping.items():

            print(
                f"{abbreviation} -> "
                f"{details['subject']} | "
                f"{details['faculty']}"
            )

        print("\n========== TRACK SUBJECTS ==========")

        track_subjects = extract_track_subjects(table)

        for code, details in track_subjects.items():

            print(
                f"{code} -> "
                f"{details['subject']} | "
                f"{details['faculty']}"
            )

        print("\n========== PARSER TESTS ==========")

        test_entries = [
            "PS DM",
            "CD SG",
            "AI ADJ",
            "B1 PPL YP LAB 2",
            "B2 DIVPL MRC LAB 3",
            "B3 CSL RJ LAB 3",
            "SOOAD YP (510)",
            "SOOAD YP (507)",
            "CS RJ 510",
            "DIVP MRC 507"
        ]

        for test_entry in test_entries:

            result = parse_timetable_entry(
                test_entry,
                mapping,
                track_subjects
            )

            print("\nInput:", test_entry)
            print("Output:", result)
                
        print("\n========== DIVISION A TIMETABLE ==========")

        division_a = parse_division_a(
        table,
        mapping,
        track_subjects
    )

        print("Total entries:", len(division_a))

        for entry in division_a:
            print("\n", entry)

        print("\n========== RAW PROBLEM CELLS ==========")

        for i, row in enumerate(table):
            for j, cell in enumerate(row):
                if cell and (
                    "Capstone" in cell
                    or "UD" in cell
                    or "DIVPL" in cell
                ):
                    print(f"\nRow {i}, Column {j}:")
                    print(repr(cell))