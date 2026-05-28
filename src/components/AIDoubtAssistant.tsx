import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { COLOR_THEMES } from '../data';
import { Sparkles, Send, Brain, HelpCircle, ArrowRight, History, Trash2, Check, Copy, RefreshCw, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIDoubtAssistantProps {
  courses: Course[];
  simulatedTime: {
    useRealTime: boolean;
    day: string;
    time: string;
  };
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
}

interface DoubtHistoryItem {
  id: string;
  courseId: string;
  courseSubject: string;
  courseColor: string;
  question: string;
  answer: string;
  timestamp: string;
}

export default function AIDoubtAssistant({
  courses,
  simulatedTime,
  selectedCourseId,
  setSelectedCourseId,
}: AIDoubtAssistantProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorArr, setErrorArr] = useState<string | null>(null);
  const [history, setHistory] = useState<DoubtHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const historyEndRef = useRef<HTMLDivElement>(null);

  // Load doubt history from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('student_timetable_doubts_v1');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading doubt history', err);
      }
    }
  }, []);

  // Helper: Convert "HH:MM" to minutes of day
  const toMins = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Auto-detect the last completed class
  useEffect(() => {
    if (courses.length === 0) return;

    // Default to first course if we can't find a completed one
    let targetId: string | null = courses[0].id;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = simulatedTime.useRealTime 
      ? days[new Date().getDay()] 
      : simulatedTime.day;

    const currentTimeStr = simulatedTime.useRealTime
      ? `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
      : simulatedTime.time;

    const nowMins = toMins(currentTimeStr);

    // Get all courses that take place today
    const classesToday = courses.filter(c => c.day === currentDayName);

    if (classesToday.length > 0) {
      // Find classes that have already ended today (endTime <= simulatedTime)
      const finishedClasses = classesToday
        .filter(c => toMins(c.endTime) <= nowMins)
        .sort((a, b) => toMins(b.endTime) - toMins(a.endTime)); // closest completed first

      if (finishedClasses.length > 0) {
        targetId = finishedClasses[0].id;
      } else {
        // If no class has finished, see if there's one currently in progress
        const activeClass = classesToday.find(c => {
          const start = toMins(c.startTime);
          const end = toMins(c.endTime);
          return nowMins >= start && nowMins < end;
        });
        if (activeClass) {
          targetId = activeClass.id;
        } else {
          // If no classes completed or running today, choose the next upcoming one
          const upcoming = classesToday
            .filter(c => toMins(c.startTime) > nowMins)
            .sort((a, b) => toMins(a.startTime) - toMins(b.startTime));
          if (upcoming.length > 0) {
            targetId = upcoming[0].id;
          } else {
            // Pick first class in list
            targetId = courses[0].id;
          }
        }
      }
    }

    // Set the selected course ID if none is active or selectedCourseId has not been set yet
    if (targetId && !selectedCourseId) {
      setSelectedCourseId(targetId);
    }
  }, [courses, simulatedTime, selectedCourseId, setSelectedCourseId]);

  // Find the selected/active course object
  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0] || null;
  const activeTheme = activeCourse ? COLOR_THEMES[activeCourse.color] || COLOR_THEMES.indigo : COLOR_THEMES.indigo;

  // Typical doubt-clearing prompts based on subject type
  const getSuggestionChips = (subjectName: string) => {
    const sub = subjectName.toLowerCase();
    if (sub.includes('algo') || sub.includes('data structure')) {
      return [
        "Explain Red-Black tree properties.",
        "How do I choose between BFS and DFS?",
        "Explain typical sorting algorithms Big O."
      ];
    } else if (sub.includes('machine') || sub.includes('ml') || sub.includes('ai')) {
      return [
        "Explain PyTorch Tensor gradients.",
        "Precision vs Recall: clear explanation please.",
        "Explain neural net Backpropagation."
      ];
    } else if (sub.includes('database') || sub.includes('sql') || sub.includes('dbms')) {
      return [
        "Contrast SQL normalized forms 1NF, 2NF, 3NF.",
        "What is index indexing and query optimize?",
        "Explain ACID transactions."
      ];
    } else if (sub.includes('network') || sub.includes('web')) {
      return [
        "State full lifecycle of an HTTP Request.",
        "What is the difference between TCP and UDP?",
        "Explain DNS lookup step-by-step."
      ];
    } else if (sub.includes('art') || sub.includes('design') || sub.includes('typograph')) {
      return [
        "Explain visual hierarchy principles.",
        "Contrast geometric vs humanistic sans-serif.",
        "Suggestions to achieve high-contrast styling."
      ];
    }
    // Generic
    return [
      `Summarize key concepts of ${subjectName}.`,
      `Create a 5-question mock quiz for ${subjectName}.`,
      `Explain the most difficult part of ${subjectName} simply.`
    ];
  };

  const handleApplyChip = (text: string) => {
    setQuestion(text);
  };

  // Submit Question to /api/doubt
  const handleAskDoubt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || !activeCourse) return;

    setLoading(true);
    setErrorArr(null);

    try {
      const response = await fetch('/api/doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: activeCourse.subject,
          professor: activeCourse.professor,
          notes: activeCourse.notes || "None written",
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error occurred resolving your doubt.');
      }

      const data = await response.json();

      // Add to session & localStorage history
      const newHistoryItem: DoubtHistoryItem = {
        id: `doubt-${Date.now()}`,
        courseId: activeCourse.id,
        courseSubject: activeCourse.subject,
        courseColor: activeCourse.color,
        question: question.trim(),
        answer: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('student_timetable_doubts_v1', JSON.stringify(updatedHistory));

      setQuestion('');
      setShowHistory(false); // Focus on presenting the newly answered question details
      
      // Small timeout to scroll answers into view
      setTimeout(() => {
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      console.error(err);
      setErrorArr(err.message || 'Failed to connect to the doubt clearing engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all stored AI doubts session history?')) {
      setHistory([]);
      localStorage.removeItem('student_timetable_doubts_v1');
    }
  };

  return (
    <div id="ai-doubt-assistant-widget" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-200">
      
      {/* Widget Header with Course Accent Theme dynamic borders */}
      <div className="p-5 border-b border-slate-100 relative bg-linear-to-b from-indigo-50/5 via-transparent to-transparent">
        <div className={`absolute top-0 left-0 right-0 h-1 ${activeTheme.indicator}`} />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl text-white ${activeTheme.accent} shadow-sm flex items-center justify-center animate-pulse`}>
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-1">
                Gemini AI Class Doubt Assistant
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Clear post-class concepts instantly</p>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all flex items-center gap-1 text-[11px] font-bold"
            title="View Doubt History"
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {showHistory ? (
        /* DOUBT HISTORY LAYOUT */
        <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> Checked Doubts ({history.length})
            </h4>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-bold"
              >
                <Trash2 className="w-3 h-3" />
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-slate-400">No AI conversations logged yet. Ask some school doubts first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((hItem) => {
                const itemTheme = COLOR_THEMES[hItem.courseColor] || COLOR_THEMES.indigo;
                return (
                  <div key={hItem.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${itemTheme.badge}`}>
                        {hItem.courseSubject}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{hItem.timestamp}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 pl-2 border-l-2 border-indigo-500">
                      Q: {hItem.question}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 max-h-40 overflow-y-auto">
                      <div className="markdown-body font-normal text-slate-700 prose-sm prose leading-normal">
                        <ReactMarkdown>
                          {hItem.answer}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleCopy(hItem.id, hItem.answer)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 opacity-90 transition-opacity"
                      >
                        {copiedId === hItem.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowHistory(false)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl mt-2 transition-all flex items-center justify-center gap-1"
          >
            ← Back to Ask Doubts
          </button>
        </div>
      ) : (
        /* INTERACTIVE ASK SCREEN */
        <div className="p-5 flex flex-col flex-1 space-y-4">
          
          {/* Active Course Selector & Sync Indicator */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Choose Academic Class
            </label>
            {courses.length === 0 ? (
              <div className="text-xs text-slate-400 py-1 italic bg-slate-50 rounded-xl px-3 border border-slate-100 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                No courses added yet. Please add a class first!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <select
                  value={selectedCourseId || ''}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className={`w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 cursor-pointer ${
                    activeCourse ? `focus:ring-${activeCourse.color}-500 text-slate-800` : 'focus:ring-indigo-500'
                  }`}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id} className="font-semibold text-slate-700">
                      {c.subject} ({c.day} - Prof. {c.professor})
                    </option>
                  ))}
                </select>
                
                {activeCourse && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold px-2">
                    <span className={`w-2 h-2 rounded-full ${activeTheme.indicator} inline-block animate-pulse`}></span>
                    <span>Class info synced: <b>Prof. {activeCourse.professor}</b> in <b>Room {activeCourse.room}</b></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prompt chips suggestions */}
          {activeCourse && (
            <div className="space-y-1.5 pt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Suggested Doubts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getSuggestionChips(activeCourse.subject).map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => handleApplyChip(chip)}
                    className="text-[11px] font-semibold px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100 transition-all text-left max-w-full truncate"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form for writing and submitting question */}
          <form onSubmit={handleAskDoubt} className="space-y-3">
            <label htmlFor="doubt-query-input" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Your Doubt / Question
            </label>
            <div className="relative">
              <textarea
                id="doubt-query-input"
                rows={3}
                placeholder={activeCourse ? `What didn't you understand about ${activeCourse.subject}?` : "Add some classes to unlock the Doubt Assistant!"}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading || !activeCourse}
                className={`w-full text-xs font-medium px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all resize-none ${
                  activeCourse ? `focus:ring-${activeCourse.color}-500` : 'focus:ring-indigo-500 bg-slate-50/50'
                }`}
              />
            </div>

            {/* Error notifications */}
            {errorArr && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-semibold space-y-1">
                <p>{errorArr}</p>
                <p className="text-[10px] text-rose-500 font-normal">Ensure your server is live and Gemini API Key is configured in user secrets.</p>
              </div>
            )}

            {/* CTA action buttons */}
            <button
              id="submit-doubt-btn"
              type="submit"
              disabled={loading || !question.trim() || !activeCourse}
              className={`w-full py-3 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !question.trim() || !activeCourse ? 'bg-slate-300 shadow-none cursor-not-allowed' : `${activeTheme.accent} hover:opacity-95 shadow-indigo-100`
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consulting Classroom AI Assistant...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI Assistant Doubt</span>
                </>
              )}
            </button>
          </form>

          {/* Newest generated answer card inline presentation */}
          {!loading && history.length > 0 && (
            <div id="latest-doubt-reply-card" className="border border-slate-100 p-4 rounded-2xl bg-indigo-50/15 text-xs space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-700 font-bold flex items-center gap-1 bg-indigo-50 px-2.5 py-0.5 rounded-full select-none">
                  <Brain className="w-3 h-3 text-indigo-500 animate-pulse" /> Latest cleared doubt
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">{history[0].timestamp}</span>
              </div>
              
              <div className="text-xs font-extrabold text-slate-800 line-clamp-2 pl-2 border-l-2 border-indigo-500">
                Q: {history[0].question}
              </div>

              <div className="bg-white border border-slate-50 p-4 rounded-xl leading-relaxed text-slate-700 font-normal shadow-xs prose prose-sm max-h-[220px] overflow-y-auto">
                <div ref={historyEndRef} />
                <div className="markdown-body text-slate-700 tracking-wide prose pb-1 font-normal">
                  <ReactMarkdown>
                    {history[0].answer}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="flex justify-end pt-1 border-t border-slate-100/50">
                <button
                  type="button"
                  onClick={() => handleCopy(history[0].id, history[0].answer)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1"
                >
                  {copiedId === history[0].id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-mono">Copied successfully</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Answer to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
