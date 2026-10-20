import { FeedbackReport, CampusEvent, UserProfile } from './types';

// Helper to get today's month and day for realistic birthday demonstration
const now = new Date();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const currentDay = String(now.getDate()).padStart(2, '0');
const dynamicTodayBirthday = `2004-${currentMonth}-${currentDay}`;

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'dylonnnaocha@gmail.com',
    name: 'Dylon Ocha',
    email: 'dylonnnaocha@gmail.com',
    role: 'student',
    status: 'approved',
    major: 'Natural Science',
    classYear: "Class of '25",
    birthday: dynamicTodayBirthday,
    title: "Science · Class of '25",
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    lastActiveAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sarah.j@campus.edu',
    name: 'Sarah Jenkins',
    email: 'sarah.j@campus.edu',
    role: 'student',
    status: 'approved',
    major: 'Biochemistry',
    classYear: "Class of '25",
    birthday: '2003-05-14',
    title: "Biochemistry · Class of '25",
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    lastActiveAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'marcus.v@campus.edu',
    name: 'Marcus Vance',
    email: 'marcus.v@campus.edu',
    role: 'student',
    status: 'pending',
    major: 'Mechanical Engineering',
    classYear: "Class of '27",
    birthday: '2005-11-03',
    title: "Mechanical Engineering · Class of '27",
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'admin@campus.edu',
    name: 'Campus Administrator',
    email: 'admin@campus.edu',
    role: 'admin',
    status: 'approved',
    title: 'Senior Campus Operations Director',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    lastActiveAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];