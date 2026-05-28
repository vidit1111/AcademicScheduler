import React, { useState, useEffect } from 'react';
import { Course, DayOfWeek } from '../types';
import { COLOR_THEMES, COLOR_KEYS } from '../data';
import { X, Save, Clock, MapPin, Tag, BookOpen, AlertTriangle, Eye, Link } from 'lucide-react';

interface CourseFormProps {
  course: Course | null; // Null means Add Mode, populated means Edit Mode
  courses: Course[];     // For overlap detection logic
  onSave: (course: Course) => void;
  onClose: () => void;
}

export default function CourseForm({ course, courses, onSave, onClose }: CourseFormProps) {
  const [subject, setSubject] = useState('');
  const [professor, setProfessor] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [color, setColor] = useState('indigo');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate fields if editing
  useEffect(() => {
    if (course) {
      setSubject(course.subject);
      setProfessor(course.professor || '');
      setRoom(course.room || '');
      setDay(course.day);
      setStartTime(course.startTime);
      setEndTime(course.endTime);
      setColor(course.color || 'indigo');
      setNotes(course.notes || '');
      setLink(course.link || '');
    } else {
      setSubject('');
      setProfessor('');
      setRoom('');
      setDay('Monday');
      setStartTime('09:00');
      setEndTime('10:30');
      setColor('indigo');
      setNotes('');
      setLink('');
    }
    setErrorMsg('');
  }, [course]);

  // Convert time "HH:MM" to numerical minutes
  const toMins = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Overlap evaluation
  const checkOverlap = () => {
    const startMins = toMins(startTime);
    const endMins = toMins(endTime);
    
    return courses.filter(c => {
      // Exclude current course when editing
      if (course && c.id === course.id) return false;
      if (c.day !== day) return false;

      const cStart = toMins(c.startTime);
      const cEnd = toMins(c.endTime);

      // Overlap condition: start matches between existing range, or end matches, or surrounds it
      return (startMins < cEnd && endMins > cStart);
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!subject.trim()) {
      setErrorMsg('Course title/subject is required.');
      return;
    }

    const start = toMins(startTime);
    const end = toMins(endTime);

    if (start >= end) {
      setErrorMsg('The start time must precede the end time.');
      return;
    }

    // Check overlaps
    const overlaps = checkOverlap();
    if (overlaps.length > 0) {
      const firstOverlap = overlaps[0];
      setErrorMsg(
        `Time conflict: Overlaps with "${firstOverlap.subject}" (${firstOverlap.startTime} - ${firstOverlap.endTime}) on ${day}.`
      );
      return;
    }

    const savedCourse: Course = {
      id: course ? course.id : `course-${Date.now()}`,
      subject: subject.trim(),
      professor: professor.trim() || 'TBA',
      room: room.trim() || 'TBA',
      day,
      startTime,
      endTime,
      color,
      notes: notes.trim(),
      link: link.trim()
    };

    onSave(savedCourse);
  };

  const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div id="course-form-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div 
        id="course-form-modal" 
        className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-lg">
              {course ? 'Edit Class Details' : 'Add Class to Timetable'}
            </h3>
          </div>
          <button
            id="close-course-form"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div id="course-form-error" className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-700 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Class Name / Subject *</label>
            <input
              id="course-subject-field"
              type="text"
              required
              placeholder="e.g. Algorithms (CS101), Microeconomics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Professor Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Professor / Instructor</label>
              <input
                id="course-professor-field"
                type="text"
                placeholder="e.g. Dr. Arthur Pendelton"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Room / Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Room / Location</label>
              <input
                id="course-room-field"
                type="text"
                placeholder="e.g. Room 402, Science Annex"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Day Selector Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Day of the Week</label>
            <div id="course-day-buttonbar" className="flex flex-wrap gap-1.5">
              {DAYS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    day === d
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Start Time
              </label>
              <input
                id="course-start-field"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                End Time
              </label>
              <input
                id="course-end-field"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Color tag picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Color Theme Tag</label>
            <div id="course-color-picker" className="flex items-center gap-2 flex-wrap">
              {COLOR_KEYS.map(k => {
                const theme = COLOR_THEMES[k];
                const activeBorder = color === k ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : '';
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setColor(k)}
                    className={`w-7 h-7 rounded-full ${theme.accent} ${activeBorder} transition-all duration-150 relative group`}
                    title={theme.name}
                  >
                    {color === k && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Weekly Lecture Notes / Tasks</label>
              <textarea
                id="course-notes-field"
                rows={2}
                placeholder="Bring syllabus book, check homework deadlines..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Online link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
                <Link className="w-3.5 h-3.5 text-slate-400" />
                Virtual Join URL
              </label>
              <input
                id="course-link-field"
                type="url"
                placeholder="e.g. https://zoom.us/login"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[9px] text-slate-400 block italic leading-tight">We will add a clean virtual portal link button on the card if present!</span>
            </div>
          </div>

          {/* Modal Buttons Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 font-bold text-xs rounded-xl duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md duration-150"
            >
              <Save className="w-4 h-4" />
              {course ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
