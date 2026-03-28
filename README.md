# 🚀 Smart Task Manager (AI-Powered)

A premium, full-stack productivity dashboard built with **Next.js 15**, **TypeScript**, and **Google Gemini AI**. 

## ✨ Key Features
- **Premium Light UI:** A sleek, minimal dashboard designed with modern glassmorphism principles.
- **AI Streaming Briefing:** Real-time, word-by-word task summaries powered by Gemini 2.0 Flash.
- **Live Notifications:** Elegant toast feedback for all user actions via `sonner`.
- **Two-Column Layout:** A dedicated AI sidebar that feels like a professional productivity "engine".
- **Robust Sync:** Persistence layer using **Prisma** and **SQLite**.

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), Lucide React, Sonner (Toasts).
- **Backend:** Next.js API Routes, Google GenAI SDK.
- **Database:** SQLite + Prisma ORM.

## ⚡ Quick Start (Under 2 Minutes)

### 1. Clone & Install
```bash
git clone https://github.com/YashPrakash07/smart-task-manager.git
cd smart-task-manager
npm install
```

### 2. Configure Environment
Create a `.env` file in the root:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_api_key_here"
```

### 3. Initialize Database
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Launch
```bash
npm run dev
```
Visit `http://localhost:3000` and start deploying objectives!

---

