import React, { useState } from 'react';
import { Exam } from '../types';
import { Clock, MapPin, Plus, Trash2, Calendar, Hourglass, HelpCircle, FileText, Sparkles } from 'lucide-react';

interface ExamCountdownProps {
  exams: Exam[];
  onAddExam: (exam: Omit<Exam, 'id'>) => void;
  onDeleteExam: (id: string) => void;
}

export default function ExamCountdown({ exams, onAddExam, onDeleteExam }: ExamCountdownProps) {
  const [showForm, setShowForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newDate, setNewDate] = useState(() => {
    // default to next week
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    return targetDate.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('09:00');
  const [newNotes, setNewNotes] = useState('');

  // Calculate days remaining helper
  const getRemainingTime = (dateStr: string, timeStr: string) => {
    const examDateTime = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const diffMs = examDateTime.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { days: 0, hours: 0, totalHours: 0, isPast: true, label: 'Completed' };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    let label = '';
    if (days > 0) {
      label = `${days}d ${hours}h left`;
    } else {
      label = `${hours}h left`;
    }

    return { days, hours, totalHours, isPast: false, label };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newRoom.trim()) return;

    onAddExam({
      subject: newSubject.trim(),
      room: newRoom.trim(),
      date: newDate,
      time: newTime,
      notes: newNotes.trim() || undefined
    });

    setNewSubject('');
    setNewRoom('');
    setNewNotes('');
    setShowForm(false);
  };

  // Sort upcoming exams chronologically
  const sortedExams = [...exams].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time}:00`).getTime();
    const timeB = new Date(`${b.date}T${b.time}:00`).getTime();
    return timeA - timeB;
  });

  return (
    <div id="exam-countdown-widget" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-slate-800 text-sm">Exam Countdowns</h3>
          <p className="text-[11px] text-slate-400 font-medium">Keep track of key academic milestones</p>
        </div>
        <button
          id="toggle-add-exam-form"
          onClick={() => setShowForm(!showForm)}
          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors inline-flex items-center"
          title="Add Exam Tracking"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Exam Slide-out form */}
      {showForm && (
        <form id="add-exam-form" onSubmit={handleSubmit} className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 mb-4 space-y-3">
          <div className="text-xs font-bold text-rose-800">Add Exam Milestone</div>
          
          <input
            id="exam-subject-input"
            type="text"
            required
            placeholder="e.g. Midterm Physics II"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-rose-100 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-rose-700 block mb-1">Exam Date</label>
              <input
                id="exam-date-input"
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-rose-100 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-rose-450"
              />
            </div>
            <div>
              <label className="text-[10px] text-rose-700 block mb-1">Exam Time</label>
              <input
                id="exam-time-input"
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-rose-100 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-rose-450"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-rose-700 block mb-1">Room / Hall</label>
              <input
                id="exam-room-input"
                type="text"
                required
                placeholder="e.g. Science Auditorium C"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-rose-100 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-rose-450"
              />
            </div>
            <div>
              <label className="text-[10px] text-rose-700 block mb-1">Quick Note</label>
              <input
                id="exam-notes-input"
                type="text"
                placeholder="Bring #2 pencils..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-rose-100 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-rose-450"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-rose-700 bg-white border border-rose-200 rounded-lg text-[11px] font-medium hover:bg-rose-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 shadow-sm"
            >
              Add Milestone
            </button>
          </div>
        </form>
      )}

      {/* Exam Countdown list */}
      <div id="exam-listing-wrapper" className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {sortedExams.length > 0 ? (
          sortedExams.map(exam => {
            const countdown = getRemainingTime(exam.date, exam.time);
            
            // Choose colors based on urgency
            let urgencyColor = 'bg-slate-50 text-slate-700 border-slate-100';
            if (countdown.isPast) {
              urgencyColor = 'bg-slate-100 text-slate-400 border-transparent';
            } else if (countdown.totalHours <= 48) {
              urgencyColor = 'bg-rose-50 text-rose-700 border-rose-100 font-bold';
            } else if (countdown.days <= 7) {
              urgencyColor = 'bg-amber-50 text-amber-700 border-amber-100 font-semibold';
            }

            return (
              <div
                key={exam.id}
                className={`p-3.5 rounded-xl border transition-all duration-150 relative group ${
                  countdown.isPast ? 'bg-slate-50/55 border-slate-100 line-through' : 'bg-white border-slate-100 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-snug line-clamp-2">
                      {exam.subject}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {exam.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {exam.room}
                      </span>
                    </div>

                    {exam.notes && !countdown.isPast && (
                      <p className="text-[10px] text-slate-500 italic bg-slate-50 px-2 py-1 rounded border border-slate-100 mt-1">
                        "{exam.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${urgencyColor} whitespace-nowrap`}>
                      {countdown.label}
                    </span>
                    
                    <button
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Exam Milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div id="no-exams-box" className="py-6 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
            No exams scheduled. Beautiful quiet weeks ahead! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
