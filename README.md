# Smart Task Manager with AI Briefing

A minimal, production-quality full-stack task management application built with Next.js App Router, Prisma, SQLite, and the Google Gemini API.

## Features
- **Add, View, and Delete** tasks
- **Persist data** securely via an embedded SQLite database using Prisma
- **AI Daily Briefing**: Connects to the Gemini AI API to provide a friendly plain-English summary of your remaining tasks for the day
- **Premium UI**: Crafted purely with vanilla CSS without UI libraries to showcase clean layouts, responsive design, and CSS variables
- **Error Handling & Loading States**: The UI reacts gracefully when loading data or communicating with the AI service

## Tech Stack
- **Frontend & Backend**: Next.js 15 (App Router, API Routes)
- **Language**: TypeScript
- **Database**: SQLite
- **ORM**: Prisma (using v6 to avoid unsupported v7 features in initial setup)
- **AI Integration**: `@google/genai` (Google Gemini 2.5 Flash)
- **Icons**: `lucide-react`

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- NPM or another package manager

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Inside `.env`, make sure to provide your **Google Gemini API Key**:
```
GEMINI_API_KEY="your-api-key"
```

### 4. Setup Database
Initialize the Prisma SQLite database and schema:
```bash
npx prisma db push
```
*(This will automatically generate the Prisma Client for the application).*

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the app!

## Notes

### What Was Built
I built a single-page Next.js App Router application. Using App Router allows frontend code and backend API routes (`/api/tasks`, `/api/tasks/[id]`, `/api/tasks/summary`) to reside together safely, decreasing context switching and deployment complexity. I picked SQLite for an easy portable setup, and used `@google/genai` to generate an AI briefing on pending tasks using a prompt that ensures concise, actionable output.

### Trade-offs Made
- **SQLite over PostgreSQL**: I chose SQLite so reviewers can install, set up and verify the application without spinning up docker containers or provisioning a Postgres database.
- **Vanilla CSS over Tailwind**: As per instructions/preference, I utilized vanilla CSS variables instead of Tailwind CSS or UI libraries to accomplish a strong visual aesthetic.
- **Client-Side Data Fetching vs SSR**: I used a client-side API approach to fetching tasks on component mount in order to elegantly and simply handle Loading states (`"Loading tasks..."`) directly within standard React hooks, as well as handling error generation for the briefing.

### What I Would Improve With More Time
- Implement **Server Actions** in Next.js 15 instead of REST API routes.
- Add **Authentication (NextAuth)** to support multiple isolated users.
- Add ability to mark tasks as `complete` / toggle instead of just deleting them, along with sorting views.
- **Streaming Response**: Hook up OpenAI or Gemini streaming to stream the daily briefing in real-time chunk-by-chunk to the React interface to lower perceived latency.
