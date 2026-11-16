import { FeedbackReport, CampusEvent, UserProfile, CampusAnnouncement } from './types';
import { formatLocalDateIso } from './utils';

// Helper to get today's month and day for birthday support
const now = new Date();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const currentDay = String(now.getDate()).padStart(2, '0');
const dynamicTodayBirthday = `2004-${currentMonth}-${currentDay}`;

const getFutureIsoDate = (daysAhead: number): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysAhead);
  return formatLocalDateIso(d);
};

export const INITIAL_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: 'ann-101',
    type: 'notice',
    title: 'Midterm Extended Library Hours',
    message: 'Library quiet zones are open until 6:00 PM on weekdays for Midterm preparation. Senior Prefects are on duty.',
    author: 'Principal Reid',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    pinned: true,
  },
  {
    id: 'ann-102',
    type: 'poll',
    title: 'Preferred Inter-Form Sports Afternoon Format',
    message: 'Cast your vote for next month’s house & inter-form afternoon schedule.',
    author: "Kingston College Students' Council",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    pinned: false,
    pollOptions: [
      { id: 'opt-1', label: '7-a-Side Football & Relays', voters: ['headboy@kc.edu.jm'] },
      { id: 'opt-2', label: 'Basketball & Track Meet', voters: ['sarah.j@kc.edu.jm'] },
      { id: 'opt-3', label: 'Mixed House Field Games', voters: [] },
    ],
  },
  {
    id: 'ann-103',
    type: 'update',
    title: 'Computer Lab 2 Maintenance Scheduled',
    message: 'IT & Maintenance will inspect the AC compressor tomorrow at 7:30 AM before first period.',
    author: 'Principal Reid',
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    pinned: false,
  },
];

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
    title: 'North Street Library Extended Study Hours & Quiet Zone Expansion',
    type: 'initiative',
    category: 'student-life',
    urgency: 'medium',
    status: 'in-review',
    description: 'Proposing that the Student Council coordinate with school leadership and Prefects to open the Upper Library study spaces until 6:00 PM on weekdays leading up to CSEC and CAPE mock exams. Student council volunteers have drafted a rota to assist library staff.',
    location: 'North Street Campus, Main Library',
    department: 'Academic Affairs & Student Council',
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
        message: 'Draft proposal created. We have 8 senior prefects committed to monitor study sessions.',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-202',
        author: 'Principal Reid',
        role: 'admin',
        message: 'Approved in concept. Security staff have confirmed perimeter coverage until 6:30 PM.',
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
    title: '💜 Fortis Purple & White Spirit Assembly & Mentorship Forum',
    description: 'Join the entire student body, faculty, and visiting Old Boys for the annual Fortis Leadership Assembly, featuring academic award presentations and Upper 6 mentorship sessions.',
    date: getFutureIsoDate(3),
    time: '8:30 AM - 11:30 AM',
    location: 'North Street Main Auditorium',
    organizer: "Kingston College Students' Council",
    category: 'school-spirit',
    eventType: 'single-day',
    rsvps: 184,
    tags: ['Fortis', 'School Spirit', 'Mentorship', 'Purple & White'],
    capacity: 450,
    isOfficialUniversityEvent: true,
    featured: true,
    attendees: ['headboy@kc.edu.jm', 'sarah.j@kc.edu.jm']
  },
  {
    id: 'KCEV-502',
    title: 'Annual ISSA Boys & Girls Championships (Champs) Send-Off',
    description: 'Wear your purple and white! We are sending off the KC Track & Field team to Champs with a massive pep rally on the field.',
    date: getFutureIsoDate(7),
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
    date: getFutureIsoDate(12),
    endDate: getFutureIsoDate(14),
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
    date: getFutureIsoDate(16),
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