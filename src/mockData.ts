import { FeedbackReport, CampusEvent, UserProfile } from './types';

// Helper to get today's month and day for realistic birthday demonstration
const now = new Date();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const currentDay = String(now.getDate()).padStart(2, '0');
const dynamicTodayBirthday = `2004-${currentMonth}-${currentDay}`;

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'headboy@kc.edu.jm',
    name: 'Dylon Ocha',
    email: 'headboy@kc.edu.jm',
    role: 'student',
    status: 'approved',
    major: 'Natural Science',
    classYear: "Upper 6",
    birthday: dynamicTodayBirthday,
    title: "Upper 6 Science · Head Boy",
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    lastActiveAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sarah.j@kc.edu.jm',
    name: 'Sarah Jenkins',
    email: 'sarah.j@kc.edu.jm',
    role: 'student',
    status: 'approved',
    major: 'Arts & Humanities',
    classYear: "Form 5",
    birthday: '2003-05-14',
    title: "Form 5 Arts · Student Council",
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    lastActiveAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'marcus.v@kc.edu.jm',
    name: 'Marcus Vance',
    email: 'marcus.v@kc.edu.jm',
    role: 'student',
    status: 'pending',
    major: 'Business',
    classYear: "Form 4",
    birthday: '2005-11-03',
    title: "Form 4 Business",
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'principal@kc.edu.jm',
    name: 'Principal Reid',
    email: 'principal@kc.edu.jm',
    role: 'admin',
    status: 'approved',
    title: 'Principal, Kingston College',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    lastActiveAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_REPORTS: FeedbackReport[] = [
  {
    id: 'KCOI-1042',
    title: 'AC Failure & Overheating in Computer Lab 2',
    type: 'issue',
    category: 'facilities',
    urgency: 'high',
    status: 'open',
    description: 'The AC unit in Computer Lab 2 stopped working during the Form 4 IT class. The room is extremely hot, and the computers are shutting down randomly due to overheating.',
    location: 'Computer Lab 2, Melbourne Building',
    department: 'Maintenance & Facilities',
    isAnonymous: false,
    author: 'Dylon Ocha',
    authorRole: "Upper 6 Science · Head Boy",
    authorRealName: 'Dylon Ocha',
    authorEmail: 'headboy@kc.edu.jm',
    authorStudentId: 'KC-2022-8419',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    upvotes: 14,
    photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=75'
    ],
    endorsers: [
      { id: 'end-1', name: 'Sarah Jenkins', role: 'Student', email: 'sarah.j@kc.edu.jm', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { id: 'end-2', name: 'Dylon Ocha', role: 'Student', email: 'headboy@kc.edu.jm', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { id: 'end-3', name: 'Marcus Vance', role: 'Student', email: 'marcus.v@kc.edu.jm', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
    ],
    activities: [
      {
        id: 'act-101',
        author: 'Dylon Ocha',
        role: 'student',
        message: 'Reported to the IT teacher, he said we need to submit this here so the Principal can see.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-102',
        author: 'Principal Reid',
        role: 'admin',
        message: 'I have contacted the maintenance team. They will be looking at the compressor by tomorrow morning.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        statusChange: 'open',
        badgeText: 'Principal'
      }
    ]
  },
  {
    id: 'KCIS-2088',
    title: 'Annual Breast Cancer Awareness 5K Walk & Tuck Shop Fundraiser',
    type: 'initiative',
    category: 'student-life',
    urgency: 'medium',
    status: 'in-review',
    description: 'Proposing that the Student Council partner with the Health & Family Life club to host a 5K solidarity walk around North Street for Breast Cancer Awareness month. Funds raised through pink ribbon sales and Tuck Shop treats will be donated to the Jamaica Cancer Society.',
    location: 'North Street Campus & Main Field',
    department: 'Clubs & Student Life',
    isAnonymous: false,
    author: 'Sarah Jenkins',
    authorRole: "Form 5 Arts · Student Council",
    authorRealName: 'Sarah Jenkins',
    authorEmail: 'sarah.j@kc.edu.jm',
    authorStudentId: 'KC-2023-3921',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    upvotes: 28,
    endorsers: [
      { id: 'end-10', name: 'Dylon Ocha', role: 'Student', email: 'headboy@kc.edu.jm', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
      { id: 'end-11', name: 'Sarah Jenkins', role: 'Student', email: 'sarah.j@kc.edu.jm', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() }
    ],
    activities: [
      {
        id: 'act-201',
        author: 'Sarah Jenkins',
        role: 'student',
        message: 'Draft proposal created. We need permission from the Dean of Discipline to use the main field.',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-202',
        author: 'Principal Reid',
        role: 'admin',
        message: 'Approved in concept. Please coordinate with the Bursar for the fundraising aspect and security for the route.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        statusChange: 'in-review',
        badgeText: 'Principal'
      }
    ]
  },
  {
    id: 'KCIRV-3115',
    title: 'Severe Wi-Fi Latency in the Library',
    type: 'issue',
    category: 'technology',
    urgency: 'medium',
    status: 'in-progress',
    description: 'During lunch break and after school, the Wi-Fi in the library drops connection repeatedly. It is impossible to do research or use the online portals.',
    location: 'KC Library, Upper Floor',
    department: 'IT & Computer Lab',
    isAnonymous: true,
    author: 'Anonymous Student',
    authorRole: 'Student',
    authorRealName: 'Marcus Vance',
    authorEmail: 'marcus.v@kc.edu.jm',
    authorStudentId: 'KC-2024-5102',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    upvotes: 19,
    endorsers: [
      { id: 'end-21', name: 'Dylon Ocha', role: 'Student', email: 'headboy@kc.edu.jm', timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() }
    ],
    activities: [
      {
        id: 'act-301',
        author: 'Anonymous Student',
        role: 'student',
        message: 'Tested on multiple phones and laptops, it is definitely the router.',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-302',
        author: 'Principal Reid',
        role: 'admin',
        message: 'The IT department has identified a faulty switch. A replacement part has been ordered.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        statusChange: 'in-progress',
        badgeText: 'IT Department'
      }
    ]
  },
  {
    id: 'KCRS-4009',
    title: 'Water Fountain in Courtyard is Broken',
    type: 'issue',
    category: 'facilities',
    urgency: 'low',
    status: 'resolved',
    description: 'The main water fountain near the courtyard is leaking and not cooling the water.',
    location: 'Main Courtyard',
    department: 'Maintenance & Facilities',
    isAnonymous: false,
    author: 'Dylon Ocha',
    authorRole: "Upper 6 Science · Head Boy",
    authorRealName: 'Dylon Ocha',
    authorEmail: 'headboy@kc.edu.jm',
    authorStudentId: 'KC-2022-8419',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    upvotes: 9,
    resolutionNotes: 'Replaced the cooling filter and fixed the leak.',
    endorsers: [
      { id: 'end-31', name: 'Sarah Jenkins', role: 'Student', email: 'sarah.j@kc.edu.jm', timestamp: new Date(Date.now() - 65 * 60 * 60 * 1000).toISOString() }
    ],
    activities: [
      {
        id: 'act-401',
        author: 'Dylon Ocha',
        role: 'student',
        message: 'Water is warm and there is a puddle.',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-402',
        author: 'Principal Reid',
        role: 'admin',
        message: 'Maintenance fixed it this morning.',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        statusChange: 'resolved',
        badgeText: 'Maintenance'
      }
    ]
  }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'KCEV-501',
    title: '🎗️ Breast Cancer Awareness Solidarity Walk',
    description: 'Join the KC family for our annual BCA solidarity walk around the North Street campus, followed by a short ceremony and health screening info booth.',
    date: '2026-10-24',
    time: '4:00 PM - 6:30 PM',
    location: 'North Street Main Field',
    organizer: "KC Student Council & Health Club",
    category: 'bca-awareness',
    eventType: 'single-day',
    rsvps: 184,
    tags: ['BCA Month', 'Solidarity', 'Wellness', 'Fortis'],
    capacity: 350,
    isOfficialUniversityEvent: true,
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    attendees: ['headboy@kc.edu.jm', 'sarah.j@kc.edu.jm']
  },
  {
    id: 'KCEV-502',
    title: 'Annual ISSA Boys & Girls Championships (Champs) Send-Off',
    description: 'Wear your purple and white! We are sending off the KC Track & Field team to Champs with a massive pep rally on the field.',
    date: '2026-10-28',
    time: '10:00 AM - 3:00 PM',
    location: 'KC Main Field',
    organizer: 'Sports Department & Old Boys Association',
    category: 'athletics',
    eventType: 'single-day',
    rsvps: 312,
    tags: ['Champs', 'Track & Field', 'Fortis', 'Purple & White'],
    capacity: 600,
    isOfficialUniversityEvent: true,
    featured: false,
    attendees: ['headboy@kc.edu.jm']
  },
  {
    id: 'KCEV-503',
    title: 'Campus Hackathon: Build for Good 2026',
    description: 'A 3-day sprint building applications that improve student accessibility, local sustainability, and campus civic engagement. Mentors & hardware provided!',
    date: '2026-11-06',
    endDate: '2026-11-08',
    durationDays: 3,
    time: '9:00 AM - 6:00 PM Daily',
    location: 'Computer Lab 1 & 2',
    organizer: 'IT Department & Computer Club',
    category: 'academic',
    eventType: 'multi-day',
    rsvps: 120,
    tags: ['Coding', 'Hackathon', 'Innovation', 'Prizes'],
    capacity: 150,
    isOfficialUniversityEvent: true,
    featured: true,
    attendees: ['headboy@kc.edu.jm', 'marcus.v@kc.edu.jm']
  },
  {
    id: 'KCEV-504',
    title: 'Inter-Form Football Derby (Form 5 vs Upper 6)',
    description: 'The ultimate showdown on the field! Come out and support your form in the lunchtime football derby. Free entry for all students.',
    date: '2026-10-31',
    time: '12:00 PM - 1:00 PM',
    location: 'KC Main Field',
    organizer: 'Sports Department',
    category: 'athletics',
    eventType: 'single-day',
    rsvps: 245,
    tags: ['Football', 'Sports', 'Inter-Form'],
    capacity: 1200,
    isOfficialUniversityEvent: true,
    featured: false,
    attendees: ['sarah.j@kc.edu.jm']
  }
];