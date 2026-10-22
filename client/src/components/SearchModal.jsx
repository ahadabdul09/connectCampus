import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, MessageSquare, BookOpen, Calendar, Bell, Folder, ArrowRight } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { searchService } from '../services/searchService.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { Avatar } from './Avatar.jsx';
import { Badge } from './Badge.jsx';
import { formatDate } from '../utils/formatDate.js';

export function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 250);
  const navigate = useNavigate();

  useEffect(() => {
    async function executeSearch() {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResults(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchService.search(debouncedQuery);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    executeSearch();
  }, [debouncedQuery]);

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Campus Search"
      description="Find students, faculty, messages, announcements, events, and course resources."
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-campus-text-secondary" />
          <input
            type="text"
            placeholder="Type to search campus documents, messages, or people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-campus-secondary/40 border border-campus-border rounded-input text-sm text-campus-text-primary placeholder:text-campus-text-muted focus:bg-campus-surface focus:border-campus-primary focus:outline-none transition-colors"
            autoFocus
          />
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-campus-text-secondary">
            Searching campus directories...
          </div>
        ) : results ? (
          <div className="flex flex-col gap-5 max-h-[55vh] overflow-y-auto pr-1">
            {results.totalResults === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-campus-text-primary mb-1">
                  No matching records found for "{debouncedQuery}".
                </p>
                <p className="text-xs text-campus-text-secondary">
                  Try checking for spelling or searching by department name, course code, or professor name.
                </p>
              </div>
            ) : null}

            {/* People Results */}
            {results.people?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-campus-text-secondary mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>People ({results.people.length})</span>
                </div>
                <div className="divide-y divide-campus-border/60 border border-campus-border/60 rounded-card overflow-hidden">
                  {results.people.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handleNavigate('/chat')}
                      className="flex items-center justify-between p-2.5 hover:bg-campus-secondary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={person.fullName} size="sm" isOnline={person.isOnline} showStatus />
                        <div>
                          <p className="text-sm font-medium text-campus-text-primary">
                            {person.fullName}
                          </p>
                          <p className="text-xs text-campus-text-secondary">
                            {person.department?.code ? `${person.department.code} • ` : ''}
                            {person.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant="neutral">{person.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Results */}
            {results.messages?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-campus-text-secondary mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Conversations & Messages ({results.messages.length})</span>
                </div>
                <div className="divide-y divide-campus-border/60 border border-campus-border/60 rounded-card overflow-hidden">
                  {results.messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleNavigate('/chat')}
                      className="p-2.5 hover:bg-campus-secondary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-campus-text-secondary mb-1">
                        <span className="font-semibold text-campus-text-primary">
                          {msg.conversationTitle}
                        </span>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="text-xs text-campus-text-secondary line-clamp-2">
                        <span className="font-medium text-campus-text-primary">{msg.senderName}: </span>
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communities Results */}
            {results.communities?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-campus-text-secondary mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Communities & Clubs ({results.communities.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {results.communities.map((comm) => (
                    <div
                      key={comm.id}
                      onClick={() => handleNavigate('/communities')}
                      className="p-2.5 border border-campus-border/60 rounded-card hover:bg-campus-secondary/50 cursor-pointer transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-campus-text-primary">
                            {comm.title}
                          </span>
                          <Badge variant="neutral">{comm.type}</Badge>
                        </div>
                        <p className="text-xs text-campus-text-secondary line-clamp-2">
                          {comm.description || 'Campus academic group.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Results */}
            {results.resources?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-campus-text-secondary mb-2">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Academic Resources ({results.resources.length})</span>
                </div>
                <div className="divide-y divide-campus-border/60 border border-campus-border/60 rounded-card overflow-hidden">
                  {results.resources.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleNavigate('/resources')}
                      className="p-2.5 hover:bg-campus-secondary/50 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="max-w-[85%]">
                        <p className="text-sm font-medium text-campus-text-primary truncate">
                          {res.title}
                        </p>
                        <p className="text-xs text-campus-text-secondary truncate">
                          {res.category} • {res.department?.code || 'General'}
                        </p>
                      </div>
                      <Badge variant="neutral">{res.fileType}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-campus-text-secondary">
            Quick suggestion: Try searching for announcements, syllabus documents, event titles, or campus channels.
          </div>
        )}
      </div>
    </Modal>
  );
}
