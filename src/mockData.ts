import { FeedbackReport, CampusEvent, UserProfile } from './types';

// Helper to get today's month and day for realistic birthday demonstration
const now = new Date();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const currentDay = String(now.getDate()).padStart(2, '0');
const dynamicTodayBirthday = `2004-${currentMonth}-${currentDay}`;

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'dyloniscouncilpresident@gmail.com',
    name: 'Dylon SCPres',
    email: 'dylonnnaocha@gmail.com',
    role: 'student',
    status: 'approved',
    major: 'Natural Science',
    classYear: "Class of '25",
    birthday: dynamicTodayBirthday, // Celebrates birthday today!
    title: "Science · Class of '26",
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
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
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
  // Inside INITIAL_USERS:
  {
    id: 'sarah.j@campus.edu',
    // ...
    lastActiveAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
  },
  {
    id: 'admin@campus.edu',
    // ...
    lastActiveAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 min ago
  },
];

export const INITIAL_REPORTS: FeedbackReport[] = [
  {
    id: 'KCOI-1042',
    title: 'AC Failure & Overheating in Engineering Block B - Lab 402',
    type: 'issue',
    category: 'facilities',
    urgency: 'high',
    status: 'open',
    description: 'The central cooling unit in Lab 402 stopped circulating cold air yesterday afternoon during afternoon lab sections. Room temperature reached 84°F, causing server rack temperature alarms to trigger and discomfort for 35+ enrolled students.',
    location: 'Engineering Block B, Room 402',
    department: 'Campus Facilities & Operations',
    isAnonymous: false,
    author: 'Dylon Ocha',
    authorRole: "Computer Science · Class of '26",
    authorRealName: 'Dylon Ocha',
    authorEmail: 'dylonnnaocha@gmail.com',
    authorStudentId: 'KC-2022-8419',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    upvotes: 14,
    photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=75'
    ],
    endorsers: [
      { id: 'end-1', name: 'Sarah Jenkins', role: 'Student', email: 'sarah.j@campus.edu', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { id: 'end-2', name: 'Dylon Ocha', role: 'Student', email: 'dylonnnaocha@gmail.com', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      { id: 'end-3', name: 'Marcus Vance', role: 'Student', email: 'marcus.v@campus.edu', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
    ],
    activities: [
      {
        id: 'act-101',
        author: 'Dylon Ocha',
        role: 'student',
        message: 'Filed initial emergency report. Lab instructor advised reporting immediately before high-temperature hardware shutoff occurs.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-102',
        author: 'Campus Administrator',
        role: 'admin',
        message: 'Ticket received by HVAC emergency dispatch team. Technician dispatched with replacement thermostat sensor for AHU-3.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        statusChange: 'open',
        badgeText: 'Official Campus Administrator'
      }
    ]
  },
  {
    id: 'KCIS-2088',
    title: 'Annual Breast Cancer Awareness 5K Campus Walk & Fundraiser',
    type: 'initiative',
    category: 'student-life',
    urgency: 'medium',
    status: 'in-review',
    description: 'Proposing that the Student Council partner with the University Health Center to host a 5K solidarity walk around the campus perimeter for Breast Cancer Awareness month. Funds raised through pink ribbon merchandise and registration to be donated to local oncology research.',
    location: 'Main Quad & Perimeter Campus Trail',
    department: 'Student Affairs & Leadership',
    isAnonymous: false,
    author: 'Sarah Jenkins',
    authorRole: "Biochemistry · Class of '25",
    authorRealName: 'Sarah Jenkins',
    authorEmail: 'sarah.j@campus.edu',
    authorStudentId: 'KC-2023-3921',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    upvotes: 28,
    endorsers: [
      { id: 'end-10', name: 'Dylon Ocha', role: 'Student', email: 'dylonnnaocha@gmail.com', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
      { id: 'end-11', name: 'Sarah Jenkins', role: 'Student', email: 'sarah.j@campus.edu', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() }
    ],
    activities: [
      {
        id: 'act-201',
        author: 'Sarah Jenkins',
        role: 'student',
        message: 'Proposal drafted with student activities council. 4 student organizations have committed volunteer marshals.',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-202',
        author: 'Campus Administrator',
        role: 'admin',
        message: 'Approved in concept by Dean of Students. Currently coordinating route safety permits with Campus Safety & Police.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        statusChange: 'in-review',
        badgeText: 'Official Campus Administrator'
      }
    ]
  },
  {
    id: 'KCIRV-3115',
    title: 'Severe Wi-Fi Latency & Packet Drop on Science Library 3rd Floor',
    type: 'issue',
    category: 'technology',
    urgency: 'medium',
    status: 'in-progress',
    description: 'During peak study hours (2 PM - 6 PM), access points on the 3rd floor quiet study zone drop connection repeatedly. Speeds drop below 0.8 Mbps, causing research portal timeouts.',
    location: 'Science Library, 3rd Floor Quiet Zone',
    department: 'Central Campus IT',
    isAnonymous: true,
    author: 'Anonymous Student',
    authorRole: 'Enrolled Student',
    authorRealName: 'Marcus Vance',
    authorEmail: 'marcus.v@campus.edu',
    authorStudentId: 'KC-2024-5102',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    upvotes: 19,
    endorsers: [
      { id: 'end-21', name: 'Dylon Ocha', role: 'Student', email: 'dylonnnaocha@gmail.com', timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() }
    ],
    activities: [
      {
        id: 'act-301',
        author: 'Anonymous Student',
        role: 'student',
        message: 'Issue confirmed across MacBook, ThinkPad, and mobile test devices.',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-302',
        author: 'Campus Administrator',
        role: 'admin',
        message: 'IT Network Ops identified a failing PoE switch port on AP-LIB-304. Replacement hardware scheduled for installation during midnight maintenance window.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        statusChange: 'in-progress',
        badgeText: 'Central Campus IT'
      }
    ]
  },
  {
    id: 'KCRS-4009',
    title: 'Rapid Hydration Station Filter Replacement in Student Union',
    type: 'issue',
    category: 'facilities',
    urgency: 'low',
    status: 'resolved',
    description: 'The Elkay filtered water fountain indicator light turned red next to the food court entrance.',
    location: 'Student Union, Level 1 Food Court Entrance',
    department: 'Campus Facilities & Operations',
    isAnonymous: false,
    author: 'Dylon Ocha',
    authorRole: "Computer Science · Class of '26",
    authorRealName: 'Dylon Ocha',
    authorEmail: 'dylonnnaocha@gmail.com',
    authorStudentId: 'KC-2022-8419',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    upvotes: 9,
    resolutionNotes: 'Brand new certified filter installed and water flow rate calibrated. Status indicator verified green.',
    endorsers: [
      { id: 'end-31', name: 'Sarah Jenkins', role: 'Student', email: 'sarah.j@campus.edu', timestamp: new Date(Date.now() - 65 * 60 * 60 * 1000).toISOString() }
    ],
    activities: [
      {
        id: 'act-401',
        author: 'Dylon Ocha',
        role: 'student',
        message: 'Filter indicator light is solid red.',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'act-402',
        author: 'Campus Administrator',
        role: 'admin',
        message: 'Facilities maintenance completed filter replacement and sanitary flush. Unit tested at optimal flow rate.',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        statusChange: 'resolved',
        badgeText: 'Campus Facilities & Operations'
      }
    ]
  }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'KCEV-501',
    title: '🎗️ Breast Cancer Awareness Solidarity Walk & Vigil',
    description: 'Join faculty, students, and advocates for our annual BCA solidarity walk around the campus quad, followed by a tribute celebration and health screening info booth.',
    date: '2026-10-24',
    time: '4:00 PM - 6:30 PM',
    location: 'Campus Main Quad & Health Pavilion',
    organizer: "KC Students' Council & Health Wellness Center",
    category: 'bca-awareness',
    eventType: 'single-day',
    rsvps: 184,
    tags: ['BCA Month', 'Solidarity', 'Wellness', 'Campus Life'],
    capacity: 350,
    isOfficialUniversityEvent: true,
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    attendees: ['dylonnnaocha@gmail.com', 'sarah.j@campus.edu']
  },
  {
    id: 'KCEV-502',
    title: 'Fall 2026 Tech & Engineering Career Expo',
    description: 'Connect with over 45 industry recruiters, defense and software engineering firms offering internships, co-ops, and full-time positions.',
    date: '2026-10-28',
    time: '10:00 AM - 3:00 PM',
    location: 'Student Athletic Center Gymnasium',
    organizer: 'University Career & Professional Development',
    category: 'career',
    eventType: 'single-day',
    rsvps: 312,
    tags: ['Career', 'Internships', 'Networking', 'Tech'],
    capacity: 600,
    isOfficialUniversityEvent: true,
    featured: false,
    attendees: ['dylonnnaocha@gmail.com']
  },
  {
    id: 'KCEV-503',
    title: 'Campus Hackathon: Build for Good 2026',
    description: 'A 3-day sprint building applications that improve student accessibility, local sustainability, and campus civic engagement. Mentors & hardware provided!',
    date: '2026-11-06',
    endDate: '2026-11-08',
    durationDays: 3,
    time: '9:00 AM - 6:00 PM Daily',
    location: 'Computer Science Innovation Hub, 2nd Floor',
    organizer: 'Association for Computing Machinery (ACM) Student Chapter',
    category: 'academic',
    eventType: 'multi-day',
    rsvps: 120,
    tags: ['Coding', 'Hackathon', 'Innovation', 'Prizes'],
    capacity: 150,
    isOfficialUniversityEvent: true,
    featured: true,
    attendees: ['dylonnnaocha@gmail.com', 'marcus.v@campus.edu']
  },
  {
    id: 'KCEV-504',
    title: 'Inter-Collegiate Fall Soccer Derby',
    description: 'Cheer on the KC Varsity Soccer team against our cross-town rivals! Free student admission with KC Student ID and halftime penalty kick challenge.',
    date: '2026-10-31',
    time: '6:00 PM - 8:30 PM',
    location: 'University Stadium Field 1',
    organizer: 'Campus Athletics Department',
    category: 'athletics',
    eventType: 'single-day',
    rsvps: 245,
    tags: ['Soccer', 'Athletics', 'School Spirit'],
    capacity: 1200,
    isOfficialUniversityEvent: true,
    featured: false,
    attendees: ['sarah.j@campus.edu']
  }
];