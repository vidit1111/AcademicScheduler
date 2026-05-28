import React, { useState, useEffect } from 'react';
import { Course, Task, Exam, DayOfWeek, PresetTimetable } from './types';
import { PRESET_TIMETABLES, COLOR_THEMES } from './data';

// Components
import TimetableGrid from './components/TimetableGrid';
import NowAndNext from './components/NowAndNext';
import TaskTracker from './components/TaskTracker';
import ExamCountdown from './components/ExamCountdown';
import CourseForm from './components/CourseForm';
import AIDoubtAssistant from './components/AIDoubtAssistant';

// Icons
import {
  Calendar,
  Layers,
  BookOpen,
  Plus,
  Eye,
  FileDown,
  FileUp,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  Search,
  User,
  Coffee,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  // USER METADATA personalization
  const userEmail = "vidit8179@gmail.com";
  const userNick = userEmail.split('@')[0];
  const userName = userNick.charAt(0).toUpperCase() + userNick.slice(1);

  // Core App states
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  // Navigation & filter states
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [showWeekends, setShowWeekends] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');
  const [selectedPreset, setSelectedPreset] = useState<string>('computer_science');

  // Course Adding/Editing state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // AI Doubt active selection state
  const [selectedDoubtCourseId, setSelectedDoubtCourseId] = useState<string | null>(null);

  const handleAskDoubt = (courseId: string) => {
    setSelectedDoubtCourseId(courseId);
    setTimeout(() => {
      const element = document.getElementById('ai-doubt-assistant-widget');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // Time simulation state (shared with tracker)
  const [simulatedTime, setSimulatedTime] = useState({
    useRealTime: true,
    day: 'Monday',
    time: '09:15'
  });

  // Load from localStorage or seed initial preset
  useEffect(() => {
    const savedCourses = localStorage.getItem('student_timetable_courses');
    const savedTasks = localStorage.getItem('student_timetable_tasks');
    const savedExams = localStorage.getItem('student_timetable_exams');
    const savedWeekends = localStorage.getItem('student_timetable_weekends');
    const savedViewMode = localStorage.getItem('student_timetable_view_mode');

    if (savedWeekends) setShowWeekends(savedWeekends === 'true');
    if (savedViewMode) setViewMode(savedViewMode as 'grid' | 'agenda');

    if (savedCourses && savedTasks && savedExams) {
      try {
        setCourses(JSON.parse(savedCourses));
        setTasks(JSON.parse(savedTasks));
        setExams(JSON.parse(savedExams));
      } catch (err) {
        console.error("Error parsing localstorage data", err);
        loadPreset('computer_science');
      }
    } else {
      // First-time loading fallback preset
      loadPreset('computer_science');
    }
  }, []);

  // Save changes to localStorage
  const saveToStorage = (newCourses: Course[], newTasks: Task[], newExams: Exam[]) => {
    localStorage.setItem('student_timetable_courses', JSON.stringify(newCourses));
    localStorage.setItem('student_timetable_tasks', JSON.stringify(newTasks));
    localStorage.setItem('student_timetable_exams', JSON.stringify(newExams));
  };

  // Helper to load a Preset timetable
  const loadPreset = (presetKey: string) => {
    const preset = PRESET_TIMETABLES[presetKey];
    if (preset) {
      setCourses(preset.courses);
      setTasks(preset.tasks);
      setExams(preset.exams);
      setSelectedPreset(presetKey);
      saveToStorage(preset.courses, preset.tasks, preset.exams);
    }
  };

  // Courses Mutators
  const handleSaveCourse = (savedCourse: Course) => {
    let updatedCourses: Course[];
    const isEdit = courses.some(c => c.id === savedCourse.id);

    if (isEdit) {
      updatedCourses = courses.map(c => c.id === savedCourse.id ? savedCourse : c);
    } else {
      updatedCourses = [...courses, savedCourse];
    }

    setCourses(updatedCourses);
    saveToStorage(updatedCourses, tasks, exams);
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm("Are you sure you want to remove this class from your timetable? This will also unlink associated homework tasks.")) {
      const updatedCourses = courses.filter(c => c.id !== id);
      // Clean up courseId from tasks
      const updatedTasks = tasks.map(t => t.courseId === id ? { ...t, courseId: undefined } : t);

      setCourses(updatedCourses);
      setTasks(updatedTasks);
      saveToStorage(updatedCourses, updatedTasks, exams);
    }
  };

  // Tasks Mutators
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completed: false
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveToStorage(courses, updatedTasks, exams);
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updatedTasks);
    saveToStorage(courses, updatedTasks, exams);
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    saveToStorage(courses, updatedTasks, exams);
  };

  // Exams Mutators
  const handleAddExam = (newExamData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...newExamData,
      id: `exam-${Date.now()}`
    };

    const updatedExams = [...exams, newExam];
    setExams(updatedExams);
    saveToStorage(courses, tasks, updatedExams);
  };

  const handleDeleteExam = (id: string) => {
    const updatedExams = exams.filter(e => e.id !== id);
    setExams(updatedExams);
    saveToStorage(courses, tasks, updatedExams);
  };

  // Toggle Weekends helper
  const handleToggleWeekends = () => {
    const nextVal = !showWeekends;
    setShowWeekends(nextVal);
    localStorage.setItem('student_timetable_weekends', String(nextVal));
  };

  // Toggle ViewMode helper
  const handleToggleViewMode = (mode: 'grid' | 'agenda') => {
    setViewMode(mode);
    localStorage.setItem('student_timetable_view_mode', mode);
  };

  // JSON Export
  const handleExportJSON = () => {
    const backup = {
      courses,
      tasks,
      exams,
      exportDate: new Date().toISOString(),
      student: userName
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userName.toLowerCase()}_timetable_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // JSON Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.courses) && Array.isArray(parsed.tasks) && Array.isArray(parsed.exams)) {
          setCourses(parsed.courses);
          setTasks(parsed.tasks);
          setExams(parsed.exams);
          saveToStorage(parsed.courses, parsed.tasks, parsed.exams);
          alert("Timetable imported successfully!");
        } else {
          alert("Invalid backup file structure. Please ensure it is a valid Student Timetable backup JSON.");
        }
      } catch (err) {
        alert("Error parsing file. Ensure it is a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Reset entire state completely
  const handleClearAll = () => {
    if (confirm("Reset current timetable back to empty? You will lose any customized classes or homework.")) {
      setCourses([]);
      setTasks([]);
      setExams([]);
      setSelectedPreset('blank');
      saveToStorage([], [], []);
    }
  };

  // Helper values for current day class list counts
  const currentDayOfWeekName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getTodayClassCount = () => {
    const today = currentDayOfWeekName();
    return courses.filter(c => c.day === today).length;
  };

  return (
    <div id="student-timetable-app" className="min-h-screen bg-slate-50/50 pb-16">
      
      {/* Visual Top Decorative Header Banner */}
      <div className="h-2 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-rose-500" />

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 sticky top-0 z-40 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 flex-shrink-0 animate-pulse">
              <Calendar className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">Beta 1.1</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Academic Portal</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 leading-none">
                Student Timetable Hub
              </h1>
            </div>
          </div>

          {/* User profile & dynamic actions */}
          <div className="flex items-center gap-3.5 flex-wrap">
            
            {/* Logged in indicator */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full pl-2.5 pr-4 py-1.5 text-xs text-slate-600 font-medium">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="font-bold text-slate-700">{userName}</p>
                <p className="text-[9px] text-slate-400 truncate max-w-[110px]">{userEmail}</p>
              </div>
            </div>

            {/* Quick backup button */}
            <div className="flex items-center gap-1.5">
              <button
                id="export-data-btn"
                onClick={handleExportJSON}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                title="Export Timetable as JSON Backup"
              >
                <FileDown className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Save Backup</span>
              </button>

              <label 
                htmlFor="import-file-uploader" 
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                title="Load Backup File"
              >
                <FileUp className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Import</span>
              </label>
              <input
                id="import-file-uploader"
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main id="timetable-dashboard" className="max-w-7xl mx-auto px-4 md:px-12 mt-6">
        
        {/* Personalized Welcome Banner & Stats Row */}
        <div className="mb-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden relative">
          
          <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-indigo-50/40 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-rose-50/40 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Header info */}
            <div className="space-y-1.5">
              <span className="text-xs text-indigo-600 font-bold tracking-wider uppercase flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5" />
                Welcome Back, Academic
              </span>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight md:text-3xl">
                Ready for {currentDayOfWeekName()}'s lectures?
              </h2>
              <p className="text-sm text-slate-500">
                You currently have <b className="text-indigo-600">{getTodayClassCount()} classes</b> scheduled for today, and <b className="text-amber-600">{tasks.filter(t => !t.completed).length} pending coursework tasks</b> assignment.
              </p>
            </div>

            {/* Quick Presets Loader */}
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 w-full md:w-auto flex-shrink-0">
              <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Switch Schedule Presets
              </div>
              <div id="preset-selector-row" className="flex items-center gap-1.5">
                <button
                  onClick={() => loadPreset('computer_science')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedPreset === 'computer_science'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Software Eng.
                </button>
                <button
                  onClick={() => loadPreset('art_design')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedPreset === 'art_design'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Fine Arts
                </button>
                <button
                  onClick={handleClearAll}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedPreset === 'blank'
                      ? 'bg-slate-800 text-white border-transparent'
                      : 'bg-white hover:bg-slate-100 text-rose-600 border border-rose-100'
                  }`}
                >
                  Blank Slate
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Action controls row */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar inputs */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              id="course-search-field"
              type="text"
              placeholder="Search subjects, rooms, faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          {/* Tab controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* View Grid vs List toggle */}
            <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
              <button
                id="view-grid-toggle"
                onClick={() => handleToggleViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Weekly Grid
              </button>
              <button
                id="view-agenda-toggle"
                onClick={() => handleToggleViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Day Agenda List
              </button>
            </div>

            {/* Weekend Toggle switch */}
            <button
              id="toggle-weekend-column"
              onClick={handleToggleWeekends}
              className={`px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 hover:bg-slate-50 shadow-xs ${
                showWeekends ? 'border-semibold border-indigo-200 bg-indigo-500/10 text-indigo-700' : 'text-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showWeekends ? 'Weekends On' : 'Weekends Off'}
            </button>

            {/* Add New Lecture Button */}
            <button
              id="add-custom-class-btn"
              onClick={() => { setEditingCourse(null); setIsFormOpen(true); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>

          </div>
        </div>

        {/* Dashboard Main Grid structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main schedule view (Grid or Agenda lists) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Displaying filtered alerts if search matches */}
            {searchQuery && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-800 flex justify-between items-center">
                <span>Filtering schedule by tag/key: <b>"{searchQuery}"</b></span>
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="font-bold border-b border-indigo-600 hover:text-indigo-900"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Timetable Component */}
            <TimetableGrid
              courses={courses}
              viewMode={viewMode}
              showWeekends={showWeekends}
              searchQuery={searchQuery}
              onEditCourse={(course) => {
                setEditingCourse(course);
                setIsFormOpen(true);
              }}
              onDeleteCourse={handleDeleteCourse}
              selectedDayFilter={selectedDayFilter}
              setSelectedDayFilter={setSelectedDayFilter}
              onAskDoubt={handleAskDoubt}
            />

            {/* Tips or Quote section helper */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 text-sm">
                💡
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800">Pro-Tip for Students</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  To view details, launch links, and edit notes easily, toggle to the <b>"Day Agenda List"</b>. You can also simulate school hours using the time slider on the side to preview what class shows up as "Now in Progress".
                </p>
              </div>
            </div>

          </div>

          {/* Right Sidebar containing widgets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Now/Next tracker card */}
            <NowAndNext
              courses={courses}
              simulatedTime={simulatedTime}
              setSimulatedTime={setSimulatedTime}
            />

            {/* AI Doubt Clearer Assistant */}
            <AIDoubtAssistant
              courses={courses}
              simulatedTime={simulatedTime}
              selectedCourseId={selectedDoubtCourseId}
              setSelectedCourseId={setSelectedDoubtCourseId}
            />

            {/* Task tracker */}
            <TaskTracker
              tasks={tasks}
              courses={courses}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />

            {/* Exam countdown */}
            <ExamCountdown
              exams={exams}
              onAddExam={handleAddExam}
              onDeleteExam={handleDeleteExam}
            />

          </div>

        </div>

      </main>

      {/* Slide-over popup Form for editing / creating */}
      {isFormOpen && (
        <CourseForm
          course={editingCourse}
          courses={courses}
          onSave={handleSaveCourse}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCourse(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-100 py-6 text-center text-xs text-slate-400 select-none">
        <p>Student Timetable Workspace • Engineered with high contrast, accessibility and pixel perfection.</p>
        <p className="mt-1 font-mono">Designed for premium high education productivity.</p>
      </footer>

    </div>
  );
}
