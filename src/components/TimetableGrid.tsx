import React from 'react';
import { Course } from '../types';
import { COLOR_THEMES } from '../data';
import { Clock, MapPin, Edit, Trash2, Calendar, FileText, CheckCircle, ExternalLink, RefreshCw, Brain } from 'lucide-react';

interface TimetableGridProps {
  courses: Course[];
  viewMode: 'grid' | 'agenda';
  showWeekends: boolean;
  searchQuery: string;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  selectedDayFilter: string;
  setSelectedDayFilter: (day: string) => void;
  onAskDoubt?: (courseId: string) => void;
}

export default function TimetableGrid({
  courses,
  viewMode,
  showWeekends,
  searchQuery,
  onEditCourse,
  onDeleteCourse,
  selectedDayFilter,
  setSelectedDayFilter,
  onAskDoubt,
}: TimetableGridProps) {
  
  const DAYS_ALL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const DAYS = showWeekends ? DAYS_ALL : DAYS_ALL.slice(0, 5);

  // Filter courses based on search query
  const filteredCourses = courses.filter(c => 
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert "HH:MM" to minutes from 00:00
  const toMins = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Grid timeline config: 08:00 to 18:00 (10 hours total)
  const START_HOUR = 8;
  const END_HOUR = 18;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const START_MINS = START_HOUR * 60;
  const END_MINS = END_HOUR * 60;
  const TOTAL_MINS = END_MINS - START_MINS;

  // Render Hours column helpers
  const hoursArray = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Group classes by day for the agenda view
  const getCoursesForDay = (day: string) => {
    return filteredCourses
      .filter(c => c.day === day)
      .sort((a, b) => toMins(a.startTime) - toMins(b.startTime));
  };

  return (
    <div id="timetable-display-block">
      {/* Day Filter navigation for mobile / agenda view */}
      {viewMode === 'agenda' && (
        <div id="day-tabs-slider" className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-100">
          <button
            onClick={() => setSelectedDayFilter('All')}
            className={`px-4 py-2 text-xs font-semibold rounded-full duration-150 whitespace-nowrap ${
              selectedDayFilter === 'All'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Days
          </button>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDayFilter(day)}
              className={`px-4 py-2 text-xs font-semibold rounded-full duration-150 whitespace-nowrap ${
                selectedDayFilter === day
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* RENDER MODE: WEEKLY CALENDAR GRID */}
      {viewMode === 'grid' ? (
        <div id="weekly-calendar-grid" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Grid Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] relative">
              
              {/* Grid Header days row */}
              <div id="grid-header-days" className="grid grid-cols-[80px_1fr] border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-700 text-xs text-center select-none">
                <div className="py-3 border-r border-slate-100 flex items-center justify-center text-slate-400 font-mono text-[10px]">TIME</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))` }}>
                  {DAYS.map((day) => (
                    <div key={day} className="py-3 border-r last:border-r-0 border-slate-100 font-bold uppercase tracking-wider text-slate-600 flex flex-col items-center justify-center gap-0.5">
                      <span>{day}</span>
                      <span className="text-[10px] text-slate-400 font-normal normal-case">Classes ({courses.filter(c => c.day === day).length})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Calendar Body with Time Slots and Courses */}
              <div id="grid-inner-body" className="grid grid-cols-[80px_1fr] relative h-[650px] grid-bg-pattern bg-white">
                
                {/* Hours Left Column */}
                <div id="grid-hours-col" className="relative h-full border-r border-slate-100 text-right pr-3 flex flex-col justify-between py-1 select-none pointer-events-none">
                  {hoursArray.map((hour, idx) => {
                    const topPercent = (idx / TOTAL_HOURS) * 100;
                    return (
                      <div
                        key={hour}
                        className="text-[10px] font-bold text-slate-400 font-mono whitespace-nowrap absolute"
                        style={{ top: `calc(${topPercent}% - 6px)`, right: '12px' }}
                      >
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                    );
                  })}
                </div>

                {/* Day Columns containing Courses */}
                <div id="day-columns-container" className="relative h-full grid" style={{ gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))` }}>
                  
                  {/* Horizontal Guideline lines */}
                  {hoursArray.map((_, idx) => {
                    if (idx === 0 || idx === hoursArray.length - 1) return null;
                    const topPercent = (idx / TOTAL_HOURS) * 100;
                    return (
                      <div
                        key={idx}
                        className="absolute left-0 w-full border-t border-slate-100/70 pointer-events-none"
                        style={{ top: `${topPercent}%` }}
                      ></div>
                    );
                  })}

                  {/* Vertically dashed Day column dividers */}
                  {Array.from({ length: DAYS.length - 1 }).map((_, idx) => {
                    const leftPercent = ((idx + 1) / DAYS.length) * 100;
                    return (
                      <div
                        key={idx}
                        className="absolute top-0 h-full border-r border-slate-100/80 pointer-events-none"
                        style={{ left: `${leftPercent}%` }}
                      ></div>
                    );
                  })}

                  {/* Render Courses onto columns */}
                  {DAYS.map((day, colIdx) => {
                    const dayCourses = filteredCourses.filter(c => c.day === day);
                    const colLeftPercent = (colIdx / DAYS.length) * 100;
                    const colWidthPercent = 100 / DAYS.length;

                    return (
                      <div
                        key={day}
                        className="absolute h-full"
                        style={{ 
                          left: `${colLeftPercent}%`, 
                          width: `${colWidthPercent}%`
                        }}
                      >
                        {dayCourses.map((course) => {
                          const start = toMins(course.startTime);
                          const end = toMins(course.endTime);
                          
                          // Ensure correct boundary drawing
                          const topMin = Math.max(START_MINS, start);
                          const bottomMin = Math.min(END_MINS, end);
                          
                          if (bottomMin <= topMin) return null; // Outside displayed range

                          const topPercent = ((topMin - START_MINS) / TOTAL_MINS) * 100;
                          const heightPercent = ((bottomMin - topMin) / TOTAL_MINS) * 100;
                          
                          const colorTheme = COLOR_THEMES[course.color] || COLOR_THEMES.indigo;

                          return (
                            <div
                              key={course.id}
                              className={`absolute left-1 right-1 p-2 rounded-xl border text-xs overflow-hidden transition-all duration-200 shadow-slate-100 hover:shadow-md hover:scale-[1.01] hover:z-30 group select-none ${colorTheme.bg}`}
                              style={{ 
                                top: `${topPercent}%`, 
                                height: `${heightPercent}%`,
                                minHeight: '38px'
                              }}
                            >
                              <div className="flex flex-col justify-between h-full">
                                <div className="space-y-0.5">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="font-bold tracking-tight line-clamp-2 leading-tight">
                                      {course.subject}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                      {onAskDoubt && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); onAskDoubt(course.id); }}
                                          className="p-1 rounded-md bg-white hover:bg-indigo-50 text-indigo-600 shadow-sm transition-colors"
                                          title="Ask AI Doubt"
                                        >
                                          <Brain className="w-3 h-3" />
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onEditCourse(course); }}
                                        className="p-1 rounded-md bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-colors"
                                        title="Edit Class"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteCourse(course.id); }}
                                        className="p-1 rounded-md bg-white hover:bg-rose-100 text-rose-600 shadow-sm transition-colors"
                                        title="Delete Class"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-[10px] opacity-90 truncate font-semibold">
                                    {course.professor}
                                  </div>
                                </div>

                                <div className="space-y-1 mt-auto">
                                  <div className="flex items-center gap-1 text-[10px] font-medium opacity-80">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{course.room}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-wider opacity-80">
                                    <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span>{course.startTime}-{course.endTime}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          </div>
        </div>
      ) : (
        /* RENDER MODE: AGENDA LIST VIEW (MOBILE FRIENDLY) */
        <div id="agenda-list-view" className="space-y-6">
          {DAYS.map(day => {
            // If filtering single day, skip unselected days
            if (selectedDayFilter !== 'All' && selectedDayFilter !== day) return null;

            const dayCourses = getCoursesForDay(day);

            return (
              <div key={day} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight">{day} Session</h4>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono">
                    {dayCourses.length} {dayCourses.length === 1 ? 'class' : 'classes'}
                  </span>
                </div>

                {dayCourses.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {dayCourses.map(course => {
                      const theme = COLOR_THEMES[course.color] || COLOR_THEMES.indigo;
                      return (
                        <div
                          key={course.id}
                          className={`flex flex-col justify-between p-4 rounded-xl border transition-all hover:shadow-sm ${theme.bg}`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h5 className="font-bold text-slate-800 tracking-tight leading-snug text-sm">
                                  {course.subject}
                                </h5>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">{course.professor}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {onAskDoubt && (
                                  <button
                                    onClick={() => onAskDoubt(course.id)}
                                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white/100 text-indigo-700 border border-indigo-200/50 hover:border-indigo-300 inline-flex items-center gap-1 text-xs font-extrabold transition-all shadow-xs"
                                    title="Ask Gemini AI Doubt"
                                  >
                                    <Brain className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                                    <span>Ask AI</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onEditCourse(course)}
                                  className="p-1.5 rounded-lg bg-white/85 text-slate-600 border border-slate-200/50 hover:bg-white inline-flex items-center"
                                  title="Edit Class"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteCourse(course.id)}
                                  className="p-1.5 rounded-lg bg-white/85 text-rose-600 border border-slate-200/50 hover:bg-rose-50 inline-flex items-center"
                                  title="Delete Class"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {course.notes && (
                              <p className="text-xs text-slate-600 bg-white/40 p-2 rounded-lg border border-white/50 italic">
                                "{course.notes}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-slate-200/40 text-slate-600 font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {course.room || 'No Room'}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px] font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {course.startTime} - {course.endTime}
                            </span>
                          </div>

                          {course.link && (
                            <a
                              href={course.link}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 text-xs font-semibold text-indigo-700 bg-white/80 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 border border-indigo-100 hover:bg-white"
                            >
                              Open Virtual Lecture Portal
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-400 text-xs italic">
                    No classes scheduled for this day. Enjoy the day off!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
