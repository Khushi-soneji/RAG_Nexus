import json


INPUT_FILE = "timetable_parsed.json"
OUTPUT_FILE = "timetable_with_division.json"


# ---------------------------------------------------------
# Known division blocks from the official timetable PDFs
# ---------------------------------------------------------

DIVISION_BLOCKS = {

    "FINAL TIME TABLE FOR ODD SEM - SEM 1 FINAL.pdf": {

        (1, 1): [
            (0, 13, 1, "A"),
            (14, 27, 1, "B"),
            (28, 40, 1, "C"),
            (41, 50, 1, "Integrated A"),
        ],

        (2, 1): [
            (5, 14, 1, "Integrated B"),
        ],
    },

    "FINAL TIME TABLE FOR ODD SEM - SEM 3.pdf": {

        (1, 1): [
            (1, 10, 3, "A"),
            (11, 21, 3, "B"),
            (22, 32, 3, "C"),
        ],
    },

    "FINAL TIME TABLE FOR ODD SEM - SEM 5.pdf": {

        (1, 1): [
            (1, 10, 5, "A"),
            (11, 24, 5, "B"),
        ],
    },

    "Updated Schedule SEM 7.pdf": {

        # Table 1 contains Division A and a
        # Division B fragment.
        (1, 1): [
            (1, 7, 7, "A"),
            (7, 11, 7, "B"),
        ],

        # Table 2 is the continuation of Division B.
        (1, 2): [
            (0, 8, 7, "B"),
        ],
    }
}


# ---------------------------------------------------------
# Load raw records
# ---------------------------------------------------------

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    records = json.load(file)


# ---------------------------------------------------------
# Attach semester + division
# ---------------------------------------------------------

updated_records = []

missing = []


for record in records:

    pdf = record["pdf"]
    page = record["page"]
    table = record["table"]
    row = record["row"]

    key = (page, table)

    semester = None
    division = None

    blocks = DIVISION_BLOCKS.get(pdf, {}).get(
        key,
        []
    )

    for (
        start_row,
        end_row,
        block_semester,
        block_division
    ) in blocks:

        if start_row <= row <= end_row:

            semester = block_semester
            division = block_division
            break

    # -----------------------------------------------------
    # If no block matched, detect semester from filename
    # -----------------------------------------------------

    if semester is None:

        if "SEM 1" in pdf.upper():
            semester = 1

        elif "SEM 3" in pdf.upper():
            semester = 3

        elif "SEM 5" in pdf.upper():
            semester = 5

        elif "SEM 7" in pdf.upper():
            semester = 7

    updated = record.copy()

    updated["semester"] = semester
    updated["division"] = division

    updated_records.append(updated)

    if division is None:

        missing.append(updated)


# ---------------------------------------------------------
# Save
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

counts = {}

for record in updated_records:

    division = record["division"]

    if division:

        counts[division] = (
            counts.get(division, 0) + 1
        )


print("=" * 80)
print("SEMESTER + DIVISION ASSIGNMENT")
print("=" * 80)

print(
    f"Total records: {len(updated_records)}"
)

print()
print("Division counts:")

for division, count in sorted(counts.items()):

    print(
        f"  {division}: {count}"
    )

print()
print(
    f"Records without division: "
    f"{len(missing)}"
)

if missing:

    print()
    print("Records without division:")

    for record in missing:

        print(
            record["pdf"],
            "| Page:", record["page"],
            "| Table:", record["table"],
            "| Row:", record["row"],
            "| Cell:", repr(record["raw_cell"])
        )

print()
print(
    f"Saved to: {OUTPUT_FILE}"
)