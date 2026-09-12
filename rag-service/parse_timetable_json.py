import json
import re


INPUT_FILE = "timetable_raw.json"
OUTPUT_FILE = "timetable_parsed.json"


# ---------------------------------------------------------
# Helper: parse a single class entry
# ---------------------------------------------------------

def parse_single_entry(entry):

    entry = entry.strip()

    if not entry:
        return None

    # ---------------------------------------------
    # FIX PDF EXTRACTION ISSUE
    #
    # Example:
    # 1 PCOA JT Lab 2
    #
    # The PDF extraction dropped the batch prefix "B".
    # Interpret it as B1 while keeping the original
    # raw_cell unchanged in the output.
    # ---------------------------------------------

    entry = re.sub(
        r"^1\s+(?P<subject>[A-Za-z]+)\s+"
        r"(?P<faculty>[A-Za-z]+)\s+LAB\s+(?P<room>\d+)$",
        r"B1 \g<subject> \g<faculty> LAB \g<room>",
        entry,
        flags=re.IGNORECASE
    )

    # ---------------------------------------------
    # BREAK
    # ---------------------------------------------

    if entry.upper() == "BREAK":

        return {
            "type": "break"
        }


    # ---------------------------------------------
    # TASK
    # ---------------------------------------------

    is_task = False

    if "- TASK" in entry.upper():

        is_task = True

        entry = re.sub(
            r"\s*-\s*TASK",
            "",
            entry,
            flags=re.IGNORECASE
        ).strip()


    # ---------------------------------------------
    # Normalize spaces
    # ---------------------------------------------

    entry = re.sub(
        r"\s+",
        " ",
        entry
    ).strip()


    # ---------------------------------------------
    # Batch entry
    #
    # Example:
    # B1 PPL YP LAB 2
    # A1 PCOA DO Lab 5
    # ---------------------------------------------

    batch_match = re.match(
        r"^(?P<batch>[A-Z]{1,2}\d+)\s+"
        r"(?P<subject>[A-Za-z]+)\s+"
        r"(?P<faculty>[A-Za-z]+)"
        r"(?:\s+LAB\s*(?P<lab>\d+))?"
        r"(?:\s+(?P<room>\d+))?"
        r"(?:\s+B)?$",
        entry,
        re.IGNORECASE
    )

    if batch_match:

        data = batch_match.groupdict()

        room = data["lab"] or data["room"]

        return {
            "type": "class",
            "batch": data["batch"],
            "subject": data["subject"],
            "faculty_initials": data["faculty"],
            "room": room,
            "class_type": "Lab" if data["lab"] else "Lecture",
            "task": is_task
        }
        # ---------------------------------------------
    # Subject + faculty + room in two brackets
    #
    # Example:
    # EME (AR) (507)
    # ---------------------------------------------

    pattern = re.match(
        r"^(?P<subject>[A-Za-z]+)"
        r"\s*\((?P<faculty>[A-Za-z]+)\)"
        r"\s*\((?P<room>\d+)\)$",
        entry,
        re.IGNORECASE
    )

    if pattern:

        return {
            "type": "class",
            "batch": None,
            "subject": pattern.group("subject"),
            "faculty_initials": pattern.group("faculty"),
            "room": pattern.group("room"),
            "class_type": "Lecture",
            "task": is_task
        }
    
    # ---------------------------------------------
    # Subject + faculty + Lab room in brackets
    #
    # Examples:
    # DL MRC (505)
    # CIS RP (Lab 10)
    # NLP AKJ (604)
    # ---------------------------------------------

    pattern = re.match(
        r"^(?P<subject>[A-Za-z]+)\s+"
        r"(?P<faculty>[A-Za-z]+)"
        r"\s*\(\s*"
        r"(?:(?:LAB)\s*)?"
        r"(?P<room>\d+)"
        r"\s*\)$",
        entry,
        re.IGNORECASE
    )

    if pattern:

        return {
            "type": "class",
            "batch": None,
            "subject": pattern.group("subject"),
            "faculty_initials": pattern.group("faculty"),
            "room": pattern.group("room"),
            "class_type": "Lab" if "LAB" in entry.upper() else "Lecture",
            "task": is_task
        }
    # ---------------------------------------------
    # Subject + faculty + room
    #
    # Examples:
    # DS JY 508
    # DM PP 508
    # SOOAD YP 505
    # AI ADJ 507
    # ---------------------------------------------

    pattern = re.match(
        r"^(?P<subject>[A-Za-z]+)\s+"
        r"(?P<faculty>[A-Za-z]+)"
        r"(?:\s*\((?P<room_bracket>\d+)\))?"
        r"(?:\s+(?P<room>\d+))?"
        r"(?:\s+LAB\s*(?P<lab>\d+))?"
        r"$",
        entry,
        re.IGNORECASE
    )

    if pattern:

        data = pattern.groupdict()

        room = (
            data["room_bracket"]
            or data["room"]
            or data["lab"]
        )

        return {
            "type": "class",
            "batch": None,
            "subject": data["subject"],
            "faculty_initials": data["faculty"],
            "room": room,
            "class_type": "Lab" if data["lab"] else "Lecture",
            "task": is_task
        }

    # ---------------------------------------------
    # Subject + Lab room in brackets
    #
    # Example:
    # ES (Lab 10)
    # ---------------------------------------------

    pattern = re.match(
        r"^(?P<subject>[A-Za-z]+)"
        r"\s*\(\s*LAB\s*(?P<room>\d+)\s*\)$",
        entry,
        re.IGNORECASE
    )

    if pattern:

        return {
            "type": "class",
            "batch": None,
            "subject": pattern.group("subject"),
            "faculty_initials": None,
            "room": pattern.group("room"),
            "class_type": "Lab",
            "task": is_task
        }
    # ---------------------------------------------
    # Subject + faculty in brackets
    #
    # Examples:
    # COA (NG)
    # CPP (VS)
    # ---------------------------------------------

    pattern = re.match(
        r"^(?P<subject>[A-Za-z]+)"
        r"\s*\((?P<faculty>[A-Za-z]+)\)$",
        entry,
        re.IGNORECASE
    )

    if pattern:

        return {
            "type": "class",
            "batch": None,
            "subject": pattern.group("subject"),
            "faculty_initials": pattern.group("faculty"),
            "room": None,
            "class_type": "Lecture",
            "task": is_task
        }


    # ---------------------------------------------
    # Subject + lab
    #
    # Examples:
    # ES LAB 10
    # ---------------------------------------------

    pattern = re.match(
        r"^(?P<subject>[A-Za-z]+)"
        r"\s+LAB\s*(?P<room>\d+)$",
        entry,
        re.IGNORECASE
    )

    if pattern:

        return {
            "type": "class",
            "batch": None,
            "subject": pattern.group("subject"),
            "faculty_initials": None,
            "room": pattern.group("room"),
            "class_type": "Lab",
            "task": is_task
        }


    # ---------------------------------------------
    # Subject only
    #
    # Example:
    # ES
    # ---------------------------------------------

    pattern = re.match(
        r"^(?P<subject>[A-Za-z]+)$",
        entry
    )

    if pattern:

        return {
            "type": "class",
            "batch": None,
            "subject": pattern.group("subject"),
            "faculty_initials": None,
            "room": None,
            "class_type": "Lecture",
            "task": is_task
        }


    # ---------------------------------------------
    # Unknown format
    # ---------------------------------------------

    return {
        "type": "unparsed",
        "raw": entry
    }


# ---------------------------------------------------------
# Parse a cell
# ---------------------------------------------------------

def parse_cell(raw_cell):

    lines = raw_cell.split("\n")

    # Join lines that are continuations of a slash-separated
    # timetable entry.
    normalized_lines = []

    for line in lines:

        line = line.strip()

        if not line:
            continue

        if (
            normalized_lines
            and not re.match(
                r"^[A-Z]{1,2}\d+\s+",
                line
            )
            and "/" in normalized_lines[-1]
        ):

            normalized_lines[-1] += " " + line

        else:

            normalized_lines.append(line)


    parsed_entries = []

    for line in normalized_lines:

        # Split simultaneous classes
        parts = re.split(
            r"\s*/\s*",
            line
        )

        for part in parts:

            part = part.strip()

            if not part:
                continue

            result = parse_single_entry(part)

            if result:
                parsed_entries.append(result)

    return parsed_entries

# ---------------------------------------------------------
# Load raw JSON
# ---------------------------------------------------------

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    records = json.load(file)


# ---------------------------------------------------------
# Parse all records
# ---------------------------------------------------------

parsed_records = []


for record in records:

    parsed = record.copy()

    parsed["entries"] = parse_cell(
        record["raw_cell"]
    )

    parsed_records.append(parsed)


# ---------------------------------------------------------
# Save parsed JSON
# ---------------------------------------------------------

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        parsed_records,
        file,
        indent=4,
        ensure_ascii=False
    )


# ---------------------------------------------------------
# Statistics
# ---------------------------------------------------------

class_count = 0
break_count = 0
unparsed_count = 0


for record in parsed_records:

    for entry in record["entries"]:

        if entry["type"] == "class":
            class_count += 1

        elif entry["type"] == "break":
            break_count += 1

        elif entry["type"] == "unparsed":
            unparsed_count += 1


print("=" * 80)
print("TIMETABLE PARSING COMPLETED")
print("=" * 80)

print(
    f"Input records: {len(records)}"
)

print(
    f"Class entries: {class_count}"
)

print(
    f"Break entries: {break_count}"
)

print(
    f"Unparsed entries: {unparsed_count}"
)

print(
    f"Total entries: "
    f"{class_count + break_count + unparsed_count}"
)

print(
    f"Saved to: {OUTPUT_FILE}"
)