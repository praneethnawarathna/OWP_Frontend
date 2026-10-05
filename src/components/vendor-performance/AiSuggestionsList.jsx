import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  CalendarDays,
  CheckCircle2,
  Bot,
} from 'lucide-react';

export default function AiSuggestionsList({ suggestions = [] }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isEmpty = !suggestions || suggestions.length === 0;

  return (
    <section aria-label="AI Recommendation Insights" className="space-y-4">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF0F4] text-[#8E406F]">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <div>
            <h2
              className="text-base font-bold text-[#1E293B]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              AI Recommendation Insights
            </h2>
            <p className="text-xs text-[#737373]">
              Track when and why Oleena's AI algorithm suggests your services to couples
            </p>
          </div>
        </div>

        {!isEmpty && (
          <span className="text-xs text-[#8E406F] font-semibold bg-[#FDF0F4] px-3 py-1 rounded-full border border-[#E8C4D8]">
            {suggestions.length} {suggestions.length === 1 ? 'Listing' : 'Listings'} Suggested
          </span>
        )}
      </div>

      {/* ── Empty State ── */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#F1E5EC] bg-white py-16 px-6 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF0F4] text-[#8E406F] mb-4 shadow-xs">
            <Sparkles size={24} aria-hidden="true" />
          </div>
          <h3
            className="text-base font-bold text-[#1E293B] mb-1.5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            No AI Recommendations Yet
          </h3>
          <p className="text-xs text-[#737373] max-w-md leading-relaxed">
            Your AI recommendation insights will appear here once a listing is suggested to a customer.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FDF0F4]/60 border border-[#F1E5EC] px-3.5 py-2 text-[11px] text-[#8E406F]">
            <Info size={14} className="shrink-0" aria-hidden="true" />
            <span>
              Suggestions trigger when couple preferences match your packages, availability, and pricing.
            </span>
          </div>
        </div>
      ) : (
        /* ── Populated State (Listings with Expandable Reasoning) ── */
        <div className="space-y-3">
          {suggestions.map((item) => {
            const isExpanded = expandedIds.has(item.listingId);
            const count = item.suggestionCount || item.suggestions?.length || 0;

            return (
              <div
                key={item.listingId}
                className="rounded-2xl border border-[#F1E5EC] bg-white overflow-hidden shadow-sm transition hover:border-[#E8C4D8]"
              >
                {/* Listing Row Bar */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.listingId)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition hover:bg-[#FDF0F4]/30"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDF0F4] text-[#8E406F] border border-[#F1E5EC]">
                      <Bot size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1E293B] truncate">
                        {item.listingTitle}
                      </p>
                      <p className="text-[11px] text-[#737373] mt-0.5">
                        Matched in recommendation feeds
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF0F4] px-2.5 py-1 text-xs font-bold text-[#8E406F] border border-[#E8C4D8]">
                      <Sparkles size={11} />
                      {count} {count === 1 ? 'suggestion' : 'suggestions'}
                    </span>
                    <span className="text-[#999] hover:text-[#8E406F] transition-colors p-1">
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  </div>
                </button>

                {/* Expandable Reasoning Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-[#F9F0F5] bg-[#FCFAFB] space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8E406F] pt-2">
                      Matching Reasoning Log
                    </p>

                    <div className="space-y-2.5">
                      {item.suggestions?.map((sug) => (
                        <div
                          key={sug.id}
                          className="rounded-xl border border-[#F1E5EC] bg-white p-3.5 shadow-xs text-xs space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              {sug.customerContext || 'Matched Couple Profile'}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-[#999]">
                              {sug.matchConfidence && (
                                <span className="font-bold text-[#8E406F] bg-[#FDF0F4] px-2 py-0.5 rounded-md border border-[#F1E5EC]">
                                  {sug.matchConfidence} Match
                                </span>
                              )}
                              {sug.suggestedAt && (
                                <span className="flex items-center gap-1">
                                  <CalendarDays size={11} />
                                  {new Date(sug.suggestedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[#555] leading-relaxed pl-5">
                            {sug.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
