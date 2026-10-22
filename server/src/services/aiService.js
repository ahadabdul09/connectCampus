import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';

export class AIService {
  static async handleQuery(userId, params) {
    const startTime = Date.now();
    const mode = params.mode || 'CAMPUS_QA';
    const q = params.query.trim();

    let responseText = '';
    let contextUsed = [];

    if (mode === 'SUMMARIZE_CONVERSATION' && params.conversationId) {
      const result = await this.summarizeConversation(params.conversationId);
      responseText = result.summary;
      contextUsed = result.context;
    } else if (mode === 'EXTRACT_DEADLINES') {
      const result = await this.extractDeadlines(userId, params.conversationId);
      responseText = result.deadlines;
      contextUsed = result.context;
    } else if (mode === 'TRANSLATE') {
      responseText = await this.translateContent(q, params.targetLanguage || 'English');
      contextUsed = ['Direct translation prompt'];
    } else {
      const ragResult = await this.performRAG(q);
      responseText = ragResult.answer;
      contextUsed = ragResult.citations;
    }

    const latencyMs = Date.now() - startTime;

    await prisma.aIConversation
      .create({
        data: {
          userId,
          query: q,
          response: responseText,
          contextUsed: JSON.stringify(contextUsed),
          latencyMs,
        },
      })
      .catch(() => {});

    return {
      answer: responseText,
      mode,
      citations: contextUsed,
      latencyMs,
    };
  }

  static async performRAG(query) {
    const lowerQuery = query.toLowerCase();

    const chunks = await prisma.documentChunk.findMany({
      include: {
        document: { select: { title: true, category: true } },
      },
    });

    const keywords = lowerQuery
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['what', 'when', 'where', 'does', 'have', 'about', 'from', 'with'].includes(w));

    const scoredChunks = [];

    for (const chunk of chunks) {
      const contentLower = chunk.content.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (contentLower.includes(kw)) {
          score += 2;
        }
      }
      if (score > 0) {
        scoredChunks.push({
          content: chunk.content,
          source: `${chunk.document.title} (Section ${chunk.chunkIndex + 1})`,
          score,
        });
      }
    }

    scoredChunks.sort((a, b) => b.score - a.score);
    const topContext = scoredChunks.slice(0, 4);

    if (topContext.length === 0) {
      return {
        answer:
          "I couldn't find that information in the campus documents. Please consult your department office or an academic administrator.",
        citations: [],
      };
    }

    const contextText = topContext.map((c) => `[Source: ${c.source}]\n${c.content}`).join('\n\n');
    const citations = topContext.map((c) => c.source);

    if (ENV.AI_API_KEY && ENV.AI_API_KEY.trim().length > 0) {
      try {
        const llmAnswer = await this.callGeminiAPI(
          `You are connectCampus AI, an academic assistant for university students and faculty.
Answer the user's question accurately using ONLY the provided verified campus context below.
If the information is not present in the context, state clearly that you do not have that specific campus record.
Never hallucinate dates, policies, or guidelines.

Context:
${contextText}

Question: ${query}`
        );
        if (llmAnswer) {
          return { answer: llmAnswer, citations };
        }
      } catch (err) {
        console.warn('[AI] External LLM failed, falling back to local factual summarizer:', err);
      }
    }

    const answer = this.synthesizeContextualAnswer(query, topContext);
    return { answer, citations };
  }

  static async summarizeConversation(conversationId) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: {
        sender: { select: { fullName: true } },
      },
    });

    if (messages.length === 0) {
      return {
        summary: 'No message history available to summarize in this conversation yet.',
        context: [],
      };
    }

    const reversed = messages.reverse();
    const formattedLog = reversed.map((m) => `${m.sender.fullName}: ${m.content}`).join('\n');

    if (ENV.AI_API_KEY) {
      try {
        const llmSummary = await this.callGeminiAPI(
          `Summarize this academic conversation into a brief overview, key discussion points, and agreed action items:\n\n${formattedLog}`
        );
        if (llmSummary) {
          return { summary: llmSummary, context: [`${messages.length} messages analyzed`] };
        }
      } catch {}
    }

    const participants = Array.from(new Set(reversed.map((m) => m.sender.fullName)));
    const topics = reversed
      .map((m) => m.content)
      .filter((c) => c.length > 25)
      .slice(0, 3);

    const summaryText = `### Conversation Digest (${messages.length} messages)

**Active Participants**: ${participants.join(', ')}

**Key Points Discussed**:
${topics.map((t) => `- ${t}`).join('\n')}

**Status**: Conversation active. All relevant peer updates and file notices have been cataloged.`;

    return { summary: summaryText, context: [`${messages.length} messages analyzed`] };
  }

  static async extractDeadlines(userId, conversationId) {
    const [announcements, events] = await Promise.all([
      prisma.announcement.findMany({
        where: { priority: { in: ['URGENT', 'IMPORTANT'] } },
        take: 3,
      }),
      prisma.event.findMany({
        where: { eventDate: { gte: new Date() } },
        orderBy: { eventDate: 'asc' },
        take: 4,
      }),
    ]);

    const items = [];

    for (const ann of announcements) {
      items.push(`- **${ann.title}** (Priority: ${ann.priority})\n  *Notice*: ${ann.content.slice(0, 140)}...`);
    }

    for (const ev of events) {
      items.push(
        `- **${ev.title}**\n  *Date*: ${new Date(ev.eventDate).toLocaleDateString()} | *Location*: ${ev.location} | *Registration*: ${ev.registeredCount}/${ev.maxCapacity}`
      );
    }

    return {
      deadlines:
        items.length > 0
          ? `### Upcoming Campus Deadlines & Milestones\n\n${items.join('\n\n')}`
          : 'No immediate deadlines found in the active calendar.',
      context: ['Campus Academic Calendar & Active Notices'],
    };
  }

  static async translateContent(content, targetLanguage) {
    if (ENV.AI_API_KEY) {
      try {
        const translated = await this.callGeminiAPI(
          `Translate the following academic message accurately into ${targetLanguage}. Maintain technical terminology:\n\n${content}`
        );
        if (translated) return translated;
      } catch {}
    }

    return `[Translation to ${targetLanguage}]: ${content}`;
  }

  static synthesizeContextualAnswer(query, topContext) {
    const snippets = topContext.map((c) => c.content).join('\n\n');
    return `Based on verified campus documentation:\n\n${snippets}\n\n*Reference: ${topContext.map((c) => c.source).join('; ')}*`;
  }

  static async callGeminiAPI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.AI_API_KEY}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  static async ingestDocument({ title, category, departmentId, uploaderId, content }) {
    if (!title || !content) {
      throw new Error('Title and content are required to ingest a campus document.');
    }

    const words = content.trim().split(/\s+/);
    const chunkSize = 200;
    const overlap = 40;
    const chunks = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const slice = words.slice(i, i + chunkSize).join(' ');
      if (slice.trim().length > 0) {
        chunks.push(slice.trim());
      }
      if (i + chunkSize >= words.length) break;
    }

    const doc = await prisma.document.create({
      data: {
        title: title.trim(),
        category: category || 'HANDBOOK',
        departmentId: departmentId || null,
        uploaderId,
        chunkCount: chunks.length,
      },
    });

    for (let idx = 0; idx < chunks.length; idx++) {
      await prisma.documentChunk.create({
        data: {
          documentId: doc.id,
          chunkIndex: idx,
          content: chunks[idx],
        },
      });
    }

    return doc;
  }
}
