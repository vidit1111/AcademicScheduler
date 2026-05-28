import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { COLOR_THEMES } from '../data';
import { Play, ArrowRight, Clock, MapPin, ExternalLink, Sparkles } from 'lucide-react';

interface NowAndNextProps {
  courses: Course[];
  simulatedTime: {
    useRealTime: boolean;
    day: string;
    time: string; // "HH:MM"
  };
  setSimulatedTime: React.Dispatch<React.SetStateAction<{
    useRealTime: boolean;
    day: string;
    time: string;
  }>>;
}

export default function NowAndNext({ courses, simulatedTime, setSimulatedTime }: NowAndNextProps) {
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  // Update time based on real or simulated setting
  useEffect(() => {
    if (simulatedTime.useRealTime) {
      const updateTime = () => {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setCurrentTimeStr(`${hrs}:${mins}`);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        setCurrentDay(days[now.getDay()]);
      };
      
      updateTime();
      const interval = setInterval(updateTime, 15000); // update every 15 seconds
      return () => clearInterval(interval);
    } else {
      setCurrentTimeStr(simulatedTime.time);
      setCurrentDay(simulatedTime.day);
    }
  }, [simulatedTime]);

  // Helper to convert "HH:MM" to minutes from midnight
  const toMins = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMins = toMins(currentTimeStr || '00:00');

  // Find class currently in progress
  const currentClass = courses.find(c => {
    if (c.day !== currentDay) return false;
    const start = toMins(c.startTime);
    const end = toMins(c.endTime);
    return currentMins >= start && currentMins < end;
  });

  // Find classes today that are upcoming
  const upcomingToday = courses
    .filter(c => c.day === currentDay && toMins(c.startTime) > currentMins)
    .sort((a, b) => toMins(a.startTime) - toMins(b.startTime));

  const nextClass = upcomingToday[0] || null;

  // Calculate progress percent for current class
  let progressPercent = 0;
  let minutesLeft = 0;
  let totalDuration = 0;
  if (currentClass) {
    const start = toMins(currentClass.startTime);
    const end = toMins(currentClass.endTime);
    totalDuration = end - start;
    const elapsed = currentMins - start;
    progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    minutesLeft = end - currentMins;
  }

  // Days list for the manual selector/simulator
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalMinutes = parseInt(e.target.value);
    const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const m = String(totalMinutes % 60).padStart(2, '0');
    setSimulatedTime(prev => ({
      ...prev,
      time: `${h}:${m}`
    }));
  };

  const handleDayChange = (day: string) => {
    setSimulatedTime(prev => ({
      ...prev,
      day
    }));
  };

  const activeThemeNow = currentClass ? COLOR_THEMES[currentClass.color] || COLOR_THEMES.indigo : null;
  const activeThemeNext = nextClass ? COLOR_THEMES[nextClass.color] || COLOR_THEMES.indigo : null;

  return (
    <div id="now-and-next-container" className="space-y-4">
      {/* Dynamic Status / Time Simulator Panel */}
      <div id="time-controller-card" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h3 className="font-semibold text-slate-800 text-sm">Now & Next Tracker</h3>
          </div>
          <button
            id="toggle-real-time-btn"
            onClick={() => setSimulatedTime(prev => ({ ...prev, useRealTime: !prev.useRealTime }))}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              simulatedTime.useRealTime 
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {simulatedTime.useRealTime ? '● Live System Time' : '⚡ Simulate Time'}
          </button>
        </div>

        {/* Simulator controls if selected */}
        {!simulatedTime.useRealTime && (
          <div id="simulator-controls" className="space-y-3 pt-2 border-t border-slate-50 mt-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => handleDayChange(d)}
                  className={`px-2 py-1 rounded-md mb-1 transition-colors ${
                    currentDay === d 
                      ? 'bg-slate-800 text-white font-medium' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.substring(0, 3)}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-500 font-mono">
                <span>Time: {currentTimeStr}</span>
                <span>{currentDay}</span>
              </div>
              <input
                id="simulator-time-slider"
                type="range"
                min="480" // 08:00
                max="1080" // 18:00
                step="5"
                value={toMins(currentTimeStr || '08:00')}
                onChange={handleTimeSliderChange}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>08:00 AM</span>
                <span>01:00 PM (13:00)</span>
                <span>06:00 PM (18:00)</span>
              </div>
            </div>
          </div>
        )}

        {simulatedTime.useRealTime && (
          <div className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-2.5">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Current Date</span>
              <p className="text-xs font-semibold text-slate-700">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">System Time</span>
              <p className="text-sm font-bold text-slate-800 font-mono tracking-tight">{currentTimeStr}</p>
            </div>
          </div>
        )}
      </div>

      {/* Now Panel */}
      <div id="now-class-card" className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 rounded-l-2xl"></div>
        {activeThemeNow && (
          <div className={`absolute top-0 left-0 w-1.5 h-full ${activeThemeNow.indicator} rounded-l-2xl`}></div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Class In Progress
          </span>
          {currentClass && (
            <span className="text-xs text-slate-500 font-mono bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {currentClass.startTime} - {currentClass.endTime}
            </span>
          )}
        </div>

        {currentClass ? (
          <div id="current-class-details" className="space-y-4">
            <div>
              <h4 className="text-base font-bold text-slate-800 tracking-tight line-clamp-2 leading-snug">
                {currentClass.subject}
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">{currentClass.professor}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{currentClass.room || 'No Room Assigned'}</span>
              </div>
              {currentClass.link && (
                <a
                  href={currentClass.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Join Lecture
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Progress Segment */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-slate-400">Class Progress</span>
                <span className="text-indigo-600 font-semibold">{minutesLeft}m remaining</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    activeThemeNow ? activeThemeNow.accent : 'bg-indigo-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% done</span>
                <span>{Math.round(totalDuration - minutesLeft)}m in</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        ) : (
          <div id="no-current-class" className="py-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 border border-slate-100 mb-2">
              <Sparkles className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-0.5">Free Period</p>
            <p className="text-xs text-slate-400 px-4">There are no classes scheduled right now on this day and time.</p>
          </div>
        )}
      </div>

      {/* Next Panel */}
      <div id="next-class-card" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Up Next Today
        </span>

        {nextClass ? (
          <div id="next-class-details" className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeThemeNext ? activeThemeNext.badge : 'bg-slate-100 text-slate-800'
                }`}>
                  {nextClass.startTime}
                </span>
                <h4 className="text-sm font-bold text-slate-800 tracking-tight line-clamp-1">
                  {nextClass.subject}
                </h4>
                <p className="text-xs text-slate-500">{nextClass.professor}</p>
              </div>
              <div className="flex-shrink-0 text-right space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">Starts in</span>
                <span className="text-xs font-bold text-slate-700 font-mono">
                  {toMins(nextClass.startTime) - currentMins}m
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium bg-slate-50 rounded-lg p-2 border border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{nextClass.room}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Until {nextClass.endTime}</span>
              </div>
            </div>
          </div>
        ) : (
          <div id="no-next-class" className="py-4 text-center">
            <p className="text-xs text-slate-400">No remaining classes today! Time to relax or do homework. 👍</p>
          </div>
        )}
      </div>
    </div>
  );
}
