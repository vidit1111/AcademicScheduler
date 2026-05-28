/**
 * Types for Student Timetable Application
 */

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Course {
  id: string;
  subject: string;
  professor: string;
  room: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM" 24-hour format
  endTime: string;   // "HH:MM" 24-hour format
  color: string;     // color identifier like 'indigo', 'rose', 'emerald', etc.
  notes?: string;
  link?: string;     // course link (Zoom, Teams, portal etc.)
}

export interface Task {
  id: string;
  title: string;
  courseId?: string; // linked course ID (optional)
  dueDate: string;   // "YYYY-MM-DD"
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Exam {
  id: string;
  subject: string;
  date: string;      // "YYYY-MM-DD"
  time: string;      // "HH:MM" 24-hour format
  room: string;
  notes?: string;
}

export interface PresetTimetable {
  name: string;
  description: string;
  courses: Course[];
  tasks: Task[];
  exams: Exam[];
}
