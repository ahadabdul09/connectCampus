import React, { useState } from 'react';
import { X, Send, BookOpen, Calendar, ListChecks, Globe, ArrowUpRight, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService.js';
import { Button } from './Button.jsx';
import { cn } from '../utils/cn.js';

export function CampusAiDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello. I am the connectCampus Academic Assistant. You can ask me questions about campus placement policies, laboratory schedules, syllabus regulations, or request a summary of your active group discussions.",
      citations: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('CAMPUS_QA');

  if (!isOpen) return null;

  const handleSend = async (queryText = input, mode = selectedMode) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.query({
        query: textToSend,
        mode,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.answer,
          citations: response.citations || [],
          latencyMs: response.latencyMs,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I was unable to retrieve that information right now. Please verify your connection or consult the official campus handbook.",
          citations: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: 'Deloitte Placement Eligibility',
      prompt: 'What are the eligibility criteria and test format for the Deloitte recruitment drive?',
      mode: 'CAMPUS_QA',
      icon: BookOpen,
    },
    {
      label: 'Extract Upcoming Deadlines',
      prompt: 'Extract all upcoming academic deadlines and event milestones.',
      mode: 'EXTRACT_DEADLINES',
      icon: Calendar,
    },
    {
      label: 'Attendance Regulations',
      prompt: 'What is the minimum mandatory attendance requirement for semester examinations?',
      mode: 'CAMPUS_QA',
      icon: ListChecks,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#242622]/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-campus-surface border-l border-campus-border h-full flex flex-col z-10 shadow-modal animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-campus-border bg-campus-secondary/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-btn bg-campus-primary flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <div>
              <h3 className="font-semibold text-campus-text-primary text-sm leading-tight">
                Campus Assistant
              </h3>
              <p className="text-[11px] text-campus-text-secondary">
                RAG Engine & Academic Reference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-campus-text-secondary hover:text-campus-text-primary p-1 rounded hover:bg-campus-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex flex-col text-xs leading-relaxed max-w-[90%]',
                msg.role === 'user'
                  ? 'self-end bg-campus-primary text-white p-3 rounded-card rounded-tr-none'
                  : 'self-start bg-campus-secondary/60 text-campus-text-primary p-3 rounded-card rounded-tl-none border border-campus-border/60'
              )}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Verified Citations */}
              {msg.citations?.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-campus-border/60 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-campus-text-muted">
                    Verified Campus Citations:
                  </span>
                  {msg.citations.map((cite, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-campus-primary font-medium flex items-center gap-1"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      {cite}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="self-start bg-campus-secondary/60 p-3 rounded-card text-xs text-campus-text-secondary flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-campus-primary" />
              <span>Consulting campus database & document index...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-campus-border/40 bg-campus-surface">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-campus-text-muted mb-1.5">
            Suggested Campus Inquiries:
          </p>
          <div className="flex flex-col gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt, p.mode)}
                disabled={isLoading}
                className="flex items-center justify-between text-left px-2.5 py-1.5 text-xs bg-campus-secondary/50 hover:bg-campus-secondary border border-campus-border/50 rounded text-campus-text-primary transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2 truncate">
                  <p.icon className="w-3.5 h-3.5 text-campus-primary shrink-0" />
                  <span className="truncate">{p.label}</span>
                </div>
                <ArrowUpRight className="w-3 h-3 text-campus-text-muted shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-campus-border bg-campus-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about placement, courses, or events..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-campus-secondary/40 border border-campus-border rounded-input px-3 py-2 text-xs text-campus-text-primary placeholder:text-campus-text-muted focus:bg-campus-surface focus:border-campus-primary focus:outline-none transition-colors"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="px-3 py-2"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
          <p className="text-[10px] text-campus-text-muted text-center mt-1.5">
            connectCampus Assistant is strictly grounded in verified institutional records.
          </p>
        </div>
      </div>
    </div>
  );
}
