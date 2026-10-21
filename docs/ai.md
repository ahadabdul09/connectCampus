# Campus AI Knowledge Assistant & RAG Pipeline

connectCampus features an integrated campus intelligence assistant engineered to answer student and faculty questions about university rules, exam guidelines, placement eligibility criteria, and department schedules with **verifiable source citations**.

---

## 1. Philosophical Design & Guardrails

The Campus AI Assistant is explicitly designed to be:
- **Academic & Restrained**: No chatty emojis, no robot personas, no generic AI marketing language.
- **Strictly Grounded in Institutional Truth**: It retrieves excerpts exclusively from verified college documents stored in the `Document` and `DocumentChunk` database tables.
- **Anti-Hallucination Enforced**: When a policy or date is not in the official campus database, the assistant explicitly states:
  > *"I could not find an official university policy regarding this in the current campus handbook. Please verify directly with the Department Office or Academic Dean."*
- **Source-Cited**: Every statement is paired with an itemized citation link containing the document title, issuing office, and section.

---

## 2. Retrieval-Augmented Generation (RAG) Architecture

```
User Query: "What is the Deloitte eligibility criteria?"
    |
    v
[1. Query Pre-Processing & Tokenization]
    |
    v
[2. Knowledge Retrieval Engine]
    |---> Hybrid Search across DocumentChunk table:
    |     - TF-IDF keyword match on title & content
    |     - Vector distance match (when pgvector is enabled)
    |
    v
[3. Top-K Chunks Reranked (Top 3-5 Relevant Excerpts)]
    |
    v
[4. Prompt Assembly with Strict Institutional Guardrails]
    |
    v
[5. Gemini 2.5 Flash / Academic Summarizer API]
    |
    v
Synthesized Answer + Exact Citations Returned to Student
```

---

## 3. Chunking Strategy & Document Indexing

Academic manuals (syllabi, academic regulations, placement policies) are partitioned into chunks:
- **Chunk Size**: 500 – 800 tokens (~350 words).
- **Chunk Overlap**: 100 tokens to ensure cross-boundary definitions (such as attendance policies spanning clauses) remain coherent.
- **Metadata Tagging**: Each chunk stores:
  ```json
  {
    "documentId": "doc-regulations-2026",
    "documentTitle": "Undergraduate Academic Regulations Handbook",
    "section": "Section 4.2 - Minimum Attendance Requirements",
    "issuingAuthority": "Office of the Dean of Academics",
    "lastUpdated": "2026-08-15"
  }
  ```

---

## 4. Multi-Mode Assistance

The assistant supports 3 operational modes via `/api/ai/chat`:

1. **`CAMPUS_QA` (Default)**: Answers student questions regarding hostel rules, grading scales, library hours, re-examination procedures, and placement requirements.
2. **`SUMMARIZE_THREAD`**: Condenses lengthy discussion threads (e.g. 50+ messages in a class channel) into a structured 3-bullet action item summary for students who missed lectures.
3. **`DRAFT_ANNOUNCEMENT`**: Formats faculty notes into authoritative, professional campus announcements adhering to institutional communication standards.

---

## 5. Security, Rate Limiting & Privacy

- **No Student Data Training**: Chat logs and student private messages are never used to fine-tune external models.
- **Strict Rate Limits**: Individual accounts are limited to 20 queries per 15 minutes to prevent automated scraping or denial of service.
- **Role Isolation**: Only documents marked public or belonging to the student's department are searchable in RAG context queries.
