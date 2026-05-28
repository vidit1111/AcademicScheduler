import { PresetTimetable } from './types';

export interface ColorTheme {
  id: string;
  name: string;
  bgBgOnHover: string; // Tailwind class
  bg: string;
  border: string;
  text: string;
  badge: string;
  accent: string;
  hover: string;
  indicator: string;
}

export const COLOR_THEMES: Record<string, ColorTheme> = {
  indigo: {
    id: 'indigo',
    name: 'Indigo',
    bgBgOnHover: 'group-hover:bg-indigo-50/50',
    bg: 'bg-indigo-50/70 text-indigo-800 border-indigo-100',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    badge: 'bg-indigo-100 text-indigo-800',
    accent: 'bg-indigo-600',
    hover: 'hover:bg-indigo-50',
    indicator: 'bg-indigo-500',
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    bgBgOnHover: 'group-hover:bg-rose-50/50',
    bg: 'bg-rose-50/70 text-rose-800 border-rose-100',
    border: 'border-rose-200',
    text: 'text-rose-800',
    badge: 'bg-rose-100 text-rose-800',
    accent: 'bg-rose-600',
    hover: 'hover:bg-rose-50',
    indicator: 'bg-rose-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    bgBgOnHover: 'group-hover:bg-emerald-50/50',
    bg: 'bg-emerald-50/70 text-emerald-800 border-emerald-100',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800',
    accent: 'bg-emerald-600',
    hover: 'hover:bg-emerald-50',
    indicator: 'bg-emerald-500',
  },
  amber: {
    id: 'amber',
    name: 'Amber',
    bgBgOnHover: 'group-hover:bg-amber-50/50',
    bg: 'bg-amber-50/70 text-amber-800 border-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-800',
    accent: 'bg-amber-600',
    hover: 'hover:bg-amber-50',
    indicator: 'bg-amber-500',
  },
  sky: {
    id: 'sky',
    name: 'Sky',
    bgBgOnHover: 'group-hover:bg-sky-50/50',
    bg: 'bg-sky-50/70 text-sky-800 border-sky-100',
    border: 'border-sky-200',
    text: 'text-sky-800',
    badge: 'bg-sky-100 text-sky-800',
    accent: 'bg-sky-600',
    hover: 'hover:bg-sky-50',
    indicator: 'bg-sky-500',
  },
  violet: {
    id: 'violet',
    name: 'Violet',
    bgBgOnHover: 'group-hover:bg-violet-50/50',
    bg: 'bg-violet-50/70 text-violet-800 border-violet-100',
    border: 'border-violet-200',
    text: 'text-violet-800',
    badge: 'bg-violet-100 text-violet-800',
    accent: 'bg-violet-600',
    hover: 'hover:bg-violet-50',
    indicator: 'bg-violet-500',
  },
  teal: {
    id: 'teal',
    name: 'Teal',
    bgBgOnHover: 'group-hover:bg-teal-50/50',
    bg: 'bg-teal-50/70 text-teal-800 border-teal-100',
    border: 'border-teal-200',
    text: 'text-teal-800',
    badge: 'bg-teal-100 text-teal-800',
    accent: 'bg-teal-600',
    hover: 'hover:bg-teal-50',
    indicator: 'bg-teal-500',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    bgBgOnHover: 'group-hover:bg-orange-50/50',
    bg: 'bg-orange-50/70 text-orange-800 border-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800',
    accent: 'bg-orange-600',
    hover: 'hover:bg-orange-50',
    indicator: 'bg-orange-500',
  }
};

export const COLOR_KEYS = Object.keys(COLOR_THEMES);

export const PRESET_TIMETABLES: Record<string, PresetTimetable> = {
  computer_science: {
    name: "Software Engineering & AI",
    description: "Ideal schedule for a Computer Science major specializing in modern intelligent systems.",
    courses: [
      {
        id: "cs-101",
        subject: "Algorithms & Data Structures",
        professor: "Dr. Evelyn Wright",
        room: "Turing Hall 302",
        day: "Monday",
        startTime: "09:00",
        endTime: "10:30",
        color: "indigo",
        notes: "Remember to preview lecture notes on Red-Black trees.",
        link: "https://zoom.us/j/algorithms101"
      },
      {
        id: "cs-102",
        subject: "Introduction to Machine Learning",
        professor: "Prof. Sarah Jenkins",
        room: "Annex Building B",
        day: "Monday",
        startTime: "11:00",
        endTime: "12:30",
        color: "emerald",
        notes: "Bring Google Colab setup on your laptop.",
        link: "https://zoom.us/j/intro-ml"
      },
      {
        id: "cs-103",
        subject: "Database Systems Lecture",
        professor: "Dr. Marcus Vance",
        room: "Tech Plaza Seminar room 1",
        day: "Tuesday",
        startTime: "09:30",
        endTime: "11:00",
        color: "sky",
        notes: "Group presentation slides draft due next week.",
        link: "https://teams.microsoft.com/db-sys"
      },
      {
        id: "cs-104",
        subject: "Compiler Design & Languages",
        professor: "Dr. Alan Mercer",
        room: "Turing Hall 304",
        day: "Tuesday",
        startTime: "13:00",
        endTime: "14:30",
        color: "rose",
        notes: "Parser implementation lab check-in.",
        link: ""
      },
      {
        id: "cs-105",
        subject: "Algorithms Tutorial & Lab",
        professor: "TA Alex Chen",
        room: "Computing Lab 4",
        day: "Wednesday",
        startTime: "09:00",
        endTime: "11:00",
        color: "indigo",
        notes: "Weekly coding challenge upload on GitHub.",
        link: ""
      },
      {
        id: "cs-106",
        subject: "Computer Networks & Prot.",
        professor: "Prof. Raymond Liu",
        room: "Engineering Hall 206",
        day: "Wednesday",
        startTime: "14:00",
        endTime: "15:30",
        color: "amber",
        notes: "Quiz on TCP/IP slide packet.",
        link: ""
      },
      {
        id: "cs-107",
        subject: "Introduction to Machine Learning Lab",
        professor: "TA Sophia Martinez",
        room: "Computing Lab 2",
        day: "Thursday",
        startTime: "11:00",
        endTime: "12:30",
        color: "emerald",
        notes: "PyTorch tensor operations exercises.",
        link: "https://zoom.us/j/ml-lab"
      },
      {
        id: "cs-108",
        subject: "Database Systems Lab",
        professor: "TA Henry Cole",
        room: "Computing Lab 1",
        day: "Thursday",
        startTime: "14:00",
        endTime: "15:30",
        color: "sky",
        notes: "PostgreSQL query optimization sheets.",
        link: ""
      },
      {
        id: "cs-109",
        subject: "Web App Architecture",
        professor: "Dr. Evelyn Wright",
        room: "Tech Plaza Seminar room 2",
        day: "Friday",
        startTime: "10:00",
        endTime: "12:00",
        color: "violet",
        notes: "React server-side rendering performance lecture.",
        link: "https://zoom.us/j/webapp-arch"
      },
      {
        id: "cs-110",
        subject: "Ethics in Computer Science",
        professor: "Dr. Diana Rose",
        room: "Humanities Hall Main",
        day: "Friday",
        startTime: "13:30",
        endTime: "15:00",
        color: "teal",
        notes: "Review assigned article on bias in LLMs.",
        link: ""
      }
    ],
    tasks: [
      {
        id: "t-1",
        title: "Complete BFS/DFS coding homework",
        courseId: "cs-101",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        completed: false,
        priority: "high"
      },
      {
        id: "t-2",
        title: "Submit SQL optimization schema draft",
        courseId: "cs-103",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        completed: false,
        priority: "medium"
      },
      {
        id: "t-3",
        title: "Install PyTorch on the personal workstation",
        courseId: "cs-102",
        dueDate: new Date().toISOString().split('T')[0], // today
        completed: true,
        priority: "low"
      },
      {
        id: "t-4",
        title: "Finish compiler tokenization state diagram",
        courseId: "cs-104",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        completed: false,
        priority: "high"
      }
    ],
    exams: [
      {
        id: "e-1",
        subject: "Algorithms & Data Structures Midterm",
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from now
        time: "10:00",
        room: "Grand Assembly Hall B",
        notes: "Comprehensive cover of Linked Lists, Trees, Heaps, and Dynamic Programming. Closed book, 2 sheets of cheat sheet allowed."
      },
      {
        id: "e-2",
        subject: "Machine Learning Concepts Quiz",
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
        time: "11:00",
        room: "Annex Lecture Cinema 1",
        notes: "Multiple choice exam about supervised vs unsupervised training, loss functions, metrics, and CNN dimensions."
      }
    ]
  },
  art_design: {
    name: "Visual Arts & Interaction Design",
    description: "Creative schedule concentrating on visual arts, typography, color theory, and UI/UX.",
    courses: [
      {
        id: "art-101",
        subject: "Studio Life Drawing",
        professor: "Prof. Arthur Pendelton",
        room: "Atelier Studio A",
        day: "Monday",
        startTime: "10:00",
        endTime: "13:00",
        color: "amber",
        notes: "Remember your set of charcoal sticks and sketchpad.",
        link: ""
      },
      {
        id: "art-102",
        subject: "History of Modern Design",
        professor: "Dr. Beatrice Vance",
        room: "Gallery Lecture Room",
        day: "Monday",
        startTime: "14:30",
        endTime: "16:00",
        color: "rose",
        notes: "Read paper on Bauhaus architecture.",
        link: ""
      },
      {
        id: "art-103",
        subject: "UI/UX & Prototyping",
        professor: "Prof. Clara Ostin",
        room: "Digital Media Lab 2",
        day: "Tuesday",
        startTime: "10:00",
        endTime: "12:00",
        color: "indigo",
        notes: "Bring Figma prototypes for responsive feedback review.",
        link: "https://zoom.us/j/uiux-prototyping"
      },
      {
        id: "art-104",
        subject: "Color Science & Contrast",
        professor: "Dr. Beatrice Vance",
        room: "Light Studio 3",
        day: "Wednesday",
        startTime: "09:00",
        endTime: "11:30",
        color: "orange",
        notes: "Bring watercolor palette or iPad illustration tool.",
        link: ""
      },
      {
        id: "art-105",
        subject: "Digital Typography",
        professor: "Prof. Clara Ostin",
        room: "Digital Media Lab 2",
        day: "Thursday",
        startTime: "13:00",
        endTime: "15:00",
        color: "violet",
        notes: "Examine kerning pairs in geometric sans-serif fonts.",
        link: ""
      },
      {
        id: "art-106",
        subject: "Interactive Media Installation",
        professor: "Prof. Julian Cross",
        room: "Creative Workshop 4",
        day: "Friday",
        startTime: "11:00",
        endTime: "13:00",
        color: "teal",
        notes: "Testing light sensors with Arduino controllers.",
        link: ""
      }
    ],
    tasks: [
      {
        id: "art-t1",
        title: "Complete 10 hands/feet charcoal study sketches",
        courseId: "art-101",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false,
        priority: "high"
      },
      {
        id: "art-t2",
        title: "Refine typography wireframe grid alignment",
        courseId: "art-105",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false,
        priority: "medium"
      }
    ],
    exams: [
      {
        id: "art-e1",
        subject: "Modern Design History Research Presentation",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "14:30",
        room: "Art Gallery Auditorium",
        notes: "Oral presentation on 20th-century post-modernism. Maximum 10 slides, 12 minutes total."
      }
    ]
  },
  blank: {
    name: "Blank Schedule",
    description: "Start completely clean and build your custom academic schedule from scratch.",
    courses: [],
    tasks: [],
    exams: []
  }
};
