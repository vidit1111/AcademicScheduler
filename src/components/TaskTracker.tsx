import React, { useState } from 'react';
import { Task, Course } from '../types';
import { COLOR_THEMES } from '../data';
import { Plus, Check, Square, CheckSquare, Trash2, Tag, Calendar, AlertCircle } from 'lucide-react';

interface TaskTrackerProps {
  tasks: Task[];
  courses: Course[];
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskTracker({
  tasks,
  courses,
  onAddTask,
  onToggleTask,
  onDeleteTask
}: TaskTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState(() => {
    // default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('pending');

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterMode === 'pending') return !task.completed;
    if (filterMode === 'completed') return task.completed;
    return true;
  }).sort((a, b) => {
    // sort incomplete first, then by earliest due date
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      courseId: newCourseId || undefined,
      dueDate: newDueDate,
      priority: newPriority
    });

    setNewTitle('');
    setNewCourseId('');
    setNewPriority('medium');
    setShowAddForm(false);
  };

  // Helper to format due state
  const getDueLabel = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDate = new Date(dateStr + "T00:00:00");
    const today = new Date(todayStr + "T00:00:00");

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today', color: 'text-amber-600 bg-amber-50 font-bold' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-orange-600 bg-orange-50 font-semibold' };
    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)}d`, color: 'text-rose-600 bg-rose-50 font-bold animate-pulse' };
    return { text: `Due in ${diffDays} days`, color: 'text-slate-500 bg-slate-50' };
  };

  return (
    <div id="homework-task-tracker" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      {/* Tracker Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-slate-800 text-sm">Tasks & Homework</h3>
          <p className="text-[11px] text-slate-400 font-medium">
            {pendingCount} tasks remaining • {Math.round(progressPercent)}% done
          </p>
        </div>
        <button
          id="toggle-add-task-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors inline-flex items-center"
          title="Add New Task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar metric */}
      <div className="mb-4">
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Form modal/panel */}
      {showAddForm && (
        <form id="add-task-inline-form" onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 space-y-3">
          <div className="text-xs font-bold text-slate-700">New Task details</div>
          
          <input
            id="task-title-input"
            type="text"
            required
            placeholder="Go over project mockups, reading ch. 3..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Related Class</label>
              <select
                id="task-course-select"
                value={newCourseId}
                onChange={(e) => setNewCourseId(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">General (None)</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Priority</label>
              <select
                id="task-priority-select"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 items-end">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Due Date</label>
              <input
                id="task-due-date-input"
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-1.5 border border-slate-200 bg-white text-slate-500 text-[11px] rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-indigo-600 text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div id="task-filter-group" className="flex bg-slate-50 p-1 rounded-xl mb-3 border border-slate-100">
        {(['pending', 'completed', 'all'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors capitalize ${
              filterMode === mode 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {mode === 'pending' ? `To Do (${pendingCount})` : mode === 'completed' ? `Done (${completedCount})` : 'All'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div id="task-listing-wrapper" className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const matchedCourse = courses.find(c => c.id === task.courseId);
            const relativeDue = getDueLabel(task.dueDate);
            const courseColorTheme = matchedCourse ? (COLOR_THEMES[matchedCourse.color] || COLOR_THEMES.indigo) : null;

            return (
              <div
                key={task.id}
                className={`flex gap-3 items-start justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all duration-150 group ${
                  task.completed ? 'bg-slate-50/30 border-slate-100 opacity-65' : 'bg-white'
                }`}
              >
                <div className="flex gap-2.5 items-start flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="space-y-1 my-0.5 min-w-0">
                    <p className={`text-xs font-semibold leading-tight pr-1 line-clamp-2 ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}>
                      {task.title}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Priority dot helper */}
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        task.priority === 'high' 
                          ? 'bg-rose-50 text-rose-600' 
                          : task.priority === 'medium' 
                          ? 'bg-amber-50 text-amber-600' 
                          : 'bg-slate-50 text-slate-500'
                      }`}>
                        {task.priority}
                      </span>

                      {/* Course reference tag */}
                      {matchedCourse && (
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${
                          courseColorTheme ? `${courseColorTheme.badge} border-transparent` : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Tag className="w-2.5 h-2.5" />
                          <span className="max-w-[70px] truncate">{matchedCourse.subject}</span>
                        </span>
                      )}

                      {/* Due string tag */}
                      <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md ${relativeDue.color}`}>
                        <Calendar className="w-2.5 h-2.5" />
                        {relativeDue.text}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors self-center flex-shrink-0 opacity-0 group-hover:opacity-100"
                  title="Remove Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div id="no-tasks-placeholder" className="py-8 text-center text-slate-400 text-xs italic">
            {filterMode === 'pending' ? 'No pending assignments. Clean desk!' : 'No tasks in this list.'}
          </div>
        )}
      </div>
    </div>
  );
}
