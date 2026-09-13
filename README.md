# ✨ AI-Powered College Knowledge & Campus Assistant

An AI-powered campus assistant designed for **GLS University** that helps students quickly find academic and campus-related information through natural-language queries.

Instead of searching through multiple PDFs, notices, timetables, and other sources, students can simply ask the assistant what they need.

---

## ✨ Features
-  AI-powered college assistant
-  RAG-based search across official college documents
-  Timetable information
-  Lab availability
-  Room & campus location lookup
-  Holiday and academic calendar information
-  Chat history
-  Admin dashboard for document management
-  Student authentication

---

## 🧠 How It Works

```text
Student Query
      ↓
Node.js + Express
      ↓
Query Router
   ↙       ↓       ↘
PostgreSQL   RAG   Location Data
              ↓
          ChromaDB
              ↓
           Gemini
              ↓
          AI Answer
