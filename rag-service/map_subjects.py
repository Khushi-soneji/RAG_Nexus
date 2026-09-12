import json


INPUT_FILE = "timetable_with_division.json"
OUTPUT_FILE = "timetable_final.json"


# ============================================================
# SUBJECT MAPPINGS
# ============================================================

SUBJECTS = {

    # --------------------------------------------------------
    # SEMESTER 1
    # --------------------------------------------------------
    1: {
        "EME": {
            "code": "2601101",
            "name": "Elementary Mathematics for Engineers"
        },
        "CPP": {
            "code": "2601102",
            "name": "Computer Programming Paradigm (Python)"
        },
        "CPL": {
            "code": "2601103",
            "name": "Computer Programming Laboratory (Python)"
        },
        "COA": {
            "code": "2601104",
            "name": "Computer Organization & Architecture"
        },
        "PCOA": {
            "code": "2601105",
            "name": "Practicals of Computer Organization & Architecture"
        },
        "UHV": {
            "code": "2602101",
            "name": "Universal Human Values and Value Education"
        },
        "BCPS": {
            "code": "2602102",
            "name": "Business Communication and Presentation Skills"
        },
        "ES": {
            "code": "2602103",
            "name": "Environmental Studies"
        }
    },


    # --------------------------------------------------------
    # SEMESTER 3
    # --------------------------------------------------------
    3: {
        "DM": {
            "code": "252601301",
            "name": "Discrete Mathematics"
        },
        "CP": {
            "code": "252601302",
            "name": "Competitive Programming"
        },
        "OS": {
            "code": "252601303",
            "name": "Operating Systems"
        },
        "DS": {
            "code": "252601304",
            "name": "Data Structures"
        },
        "ISE": {
            "code": "252602301",
            "name": "Innovation, Start-up & Entrepreneurship"
        },
        "CPL": {
            "code": None,
            "name": "Computer Programming Laboratory"
        },
        "DSL": {
            "code": None,
            "name": "Data Structures Laboratory"
        },
        "OSL": {
            "code": None,
            "name": "Operating Systems Laboratory"
        }
    },


    # --------------------------------------------------------
    # SEMESTER 5
    # --------------------------------------------------------
    5: {
        "CD": {
            "code": "2601501",
            "name": "Compiler Design"
        },
        "SOOAD": {
            "code": "2601502",
            "name": "Structured & Object Oriented Analysis and Design"
        },
        "PS": {
            "code": "2601503",
            "name": "Probability and Statistics"
        },
        "AI": {
            "code": "2601504",
            "name": "Artificial Intelligence"
        },
        "PPL": {
            "code": "2601505",
            "name": "Python Programming Laboratory"
        },
        "CS": {
            "code": "2603521",
            "name": "Cyber Crimes, Cyber Laws and Cyber Security"
        },
        "CSL": {
            "code": "2603522",
            "name": "Cyber Security Laboratory"
        },
        "DIVP": {
            "code": "2603531",
            "name": "Digital Image and Video Processing"
        },
        "DIVPL": {
            "code": "2603532",
            "name": "Digital Image and Video Processing Laboratory"
        },
        "Capstone": {
            "code": None,
            "name": "Capstone I"
        }
    },


    # --------------------------------------------------------
    # SEMESTER 7
    # --------------------------------------------------------
    7: {
        "SE": {
            "code": "2601701",
            "name": "Software Engineering"
        },
        "HCI": {
            "code": "2601702",
            "name": "Human Computer Interaction"
        },
        "ISE": {
            "code": "2601703",
            "name": "Innovation, Start-up, & Entrepreneurship"
        },

        # Track subjects
        "DL": {
            "code": "2604731",
            "name": "Deep Learning"
        },
        "DLL": {
            "code": "2604731",
            "name": "Deep Learning"
        },
        "NLP": {
            "code": "2604733",
            "name": "NLP"
        },
        "NFSL": {
            "code": "2604723",
            "name": "Network and File System Forensics Laboratory"
        },
        "ASL": {
            "code": "2604724",
            "name": "Android Security Laboratory"
        },
        "CIS": {
            "code": "2604721",
            "name": "Critical Infrastructure Security"
        },
        "CSF": {
            "code": "2604722",
            "name": "Cyber Security Framework"
        }
    }
}


# ============================================================
# LOAD DATA
# ============================================================

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    records = json.load(file)


mapped_count = 0
unmapped_count = 0

# ============================================================
# MAP SUBJECTS
# ============================================================

for record in records:

    semester = record.get("semester")

    subject_map = SUBJECTS.get(
        semester,
        {}
    )

    for entry in record.get("entries", []):

        if entry.get("type") != "class":
            continue

        subject = entry.get("subject")

        # ----------------------------------------------------
        # NON-SUBJECT TIMETABLE ACTIVITIES
        # ----------------------------------------------------

        if subject == "Library":

            entry["type"] = "activity"
            entry["activity"] = "Library"
            entry["subject_code"] = None
            entry["subject_name"] = None
            entry["mapping_status"] = "activity"

            continue

        if subject == "Practice":

            entry["type"] = "activity"
            entry["activity"] = "Practice Task"
            entry["subject_code"] = None
            entry["subject_name"] = None
            entry["faculty_initials"] = None
            entry["task"] = True
            entry["mapping_status"] = "activity"

            continue

        # ----------------------------------------------------
        # SUBJECT MAPPING
        # ----------------------------------------------------

        mapping = subject_map.get(subject)

        if mapping:

            entry["subject_code"] = mapping["code"]
            entry["subject_name"] = mapping["name"]
            entry["mapping_status"] = "mapped"

            mapped_count += 1

        else:

            entry["subject_code"] = None
            entry["subject_name"] = subject
            entry["mapping_status"] = "unmapped"

            unmapped_count += 1

# ============================================================
# SAVE FINAL FILE
# ============================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        records,
        file,
        indent=4,
        ensure_ascii=False
    )


# ============================================================
# SUMMARY
# ============================================================

print("=" * 80)
print("SUBJECT MAPPING COMPLETED")
print("=" * 80)

print(f"Total records: {len(records)}")
print(f"Mapped class entries: {mapped_count}")
print(f"Unmapped class entries: {unmapped_count}")

print()
print(f"Saved to: {OUTPUT_FILE}")