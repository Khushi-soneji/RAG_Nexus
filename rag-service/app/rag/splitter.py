def split_text(text, chunk_size=700, chunk_overlap=100):

    text = text.replace("\r", "")

    lines = text.split("\n")

    # Remove empty lines
    lines = [line.strip() for line in lines if line.strip()]

    chunks = []
    current_chunk = []

    current_length = 0

    for line in lines:

        line_length = len(line)

        # If adding this line exceeds the chunk size
        if current_length + line_length + 1 > chunk_size:

            # Save current chunk
            if current_chunk:
                chunks.append("\n".join(current_chunk))

            # Create overlap from the end of the previous chunk
            overlap_lines = []
            overlap_length = 0

            for previous_line in reversed(current_chunk):

                if overlap_length + len(previous_line) > chunk_overlap:
                    break

                overlap_lines.insert(0, previous_line)
                overlap_length += len(previous_line) + 1

            current_chunk = overlap_lines
            current_length = overlap_length

        current_chunk.append(line)
        current_length += line_length + 1

    # Add final chunk
    if current_chunk:
        chunks.append("\n".join(current_chunk))

    return chunks


if __name__ == "__main__":

    from loader import load_pdf

    file_path = "documents/ACADEMIC-CALENDAR-2026 - odd semesters (1).pdf"

    text = load_pdf(file_path)

    chunks = split_text(text)

    print("Total chunks:", len(chunks))

    for i, chunk in enumerate(chunks):

        print(f"\n--- Chunk {i + 1} ---")
        print(chunk)