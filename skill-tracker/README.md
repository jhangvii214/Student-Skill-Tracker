# 🚀 Student Skill Tracker

A comprehensive, modern web application designed for students to track their professional skills, visualize progress, and showcase their portfolio to faculty and employers.

![SkillTracker Header](https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80)

## 🌟 Key Features

### 👨‍🎓 Student Dashboard
- **Skill Logging:** Easily add new skills with proficiency levels (Beginner, Intermediate, Expert).
- **Progress Visualization:** Interactive charts and progress bars to monitor learning growth.
- **Evidence Upload:** Upload certificates or project screenshots as proof of skill via Cloudinary.
- **Portfolio Gallery:** Automatically generated portfolio to showcase verified skills and projects.

### 🛡️ Admin & Faculty Panel
- **User Management:** Review student profiles and academic data.
- **Skill Verification:** Faculty can verify student-uploaded evidence for authenticity.
- **Report Generation:** Export professional PDF-style reports for any student profile.
- **Role-Based Access:** Secure access control for Students, Faculty, and Administrators.

### 🏆 Leaderboard & Gamification
- **Global Ranking:** Compete with peers based on skill points and verified expertise.
- **Badges & Achievements:** Earn recognition for reaching milestones and mastering new technologies.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Icons:** Lucide React
- **Backend/DB:** Firebase (Authentication & Firestore)
- **Storage:** Cloudinary (for evidence images)
- **Hosting:** Firebase Hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd skill-tracker
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

The project is configured for Firebase Hosting. To deploy:
```bash
npm run build
npx firebase-tools deploy
```

---

Built with ❤️ for Students.
