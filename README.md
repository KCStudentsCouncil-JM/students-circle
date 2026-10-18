# Campus Feedback Assistant & Student Hub

> Apple Feedback Assistant-inspired campus request & initiative triage portal featuring a Breast Cancer Awareness (BCA) solidarity aesthetic, interactive school events, Google Account authentication, full student profiles, and automated birthday recognition.

![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-22c55e?logo=github)

---

## ✨ Key Features

- **Apple-Inspired Feedback Triage**:
  - Filter reports by status (*Open, In-Review, In-Progress, Resolved*) and category (*Facilities, Technology, Academics, Student Life, Safety*).
  - Multi-tiered priority system (Low, Medium, High Urgency).
  - Community upvoting & student endorsement roster.
  - Interactive activity timeline with administrative replies and ticket status updates.

- **Upcoming School Events Hub**:
  - Interactive campus calendar featuring academic symposiums, BCA charity walks, homecoming rallies, and career fairs.
  - Real-time RSVP counters and event registration.
  - Category filtering and direct integration with student feedback tickets.

- **Google Account Sign-In & Full Student Profile**:
  - Sign in with Google account or University SSO.
  - Customizable profile: **Full Name**, **Photo/Avatar**, **Class Year** (e.g. *Class of 2026 / Senior*), **Major**, and **Birthday**.
  - **Birthday Highlight System**: When it is the student's birthday, the app automatically activates celebratory festive styling across the header, profile avatar halo, campus greeting banner, and activity stamps.

- **Mobile & Tablet Optimized**:
  - Dynamic `100dvh` viewport handling to prevent address bar overflow.
  - Slide-out navigation drawer with tap-outside dismiss on mobile devices.
  - Touch-friendly tap targets and horizontal scroll ribbons.

- **Administrative Audit Console**:
  - Switch between Student and Admin mode at any time.
  - Full audit trail showing student IDs, verified campus emails, and endorser records.

---

## 🚀 Quick Start (Running Locally)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/campus-feedback-assistant.git
cd campus-feedback-assistant
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deploying to GitHub Pages

This repository is pre-configured with `base: './'` in `vite.config.ts` and includes an automated GitHub Actions deployment workflow:

1. Push your changes to the `main` (or `master`) branch:
   ```bash
   git add .
   git commit -m "Deploy to GitHub"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) will automatically build and publish your site at:
   `https://<your-username>.github.io/<repository-name>/`

---

## 📁 Project Architecture

```
├── .github/
│   └── workflows/
│       └── deploy.yml       # Automated GitHub Pages CI/CD workflow
├── public/
│   └── favicon.svg          # BCA ribbon SVG favicon
├── src/
│   ├── components/
│   │   ├── EventsSection.tsx      # School events calendar & RSVP module
│   │   ├── FeedbackDetail.tsx     # Comprehensive report view & timeline
│   │   ├── FeedbackList.tsx       # Searchable report cards grid
│   │   ├── NewFeedbackModal.tsx   # Issue reporting & initiative modal
│   │   ├── PortalPage.tsx         # Sign-in portal with Google Auth & Profile
│   │   ├── Sidebar.tsx            # Filter navigation drawer
│   │   └── TopBar.tsx             # Responsive header, search & profile halo
│   ├── types.ts                   # TypeScript interfaces (AuthUser, Report, Event)
│   ├── mockData.ts                # Initial mock campus data & presets
│   ├── index.css                  # Tailwind CSS v4 styling & utilities
│   ├── App.tsx                    # State orchestrator & layout
│   └── main.tsx                   # React root entry point
├── index.html                     # HTML5 shell with responsive meta
├── package.json                   # Dependencies & scripts
└── vite.config.ts                 # Vite config with relative base for GitHub Pages
```

---

## 📄 License
Licensed under Apache-2.0.
