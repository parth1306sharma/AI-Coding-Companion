# OffByOne 🎯

**An AI-powered workspace for competitive programmers.**

Stop tab-switching between your problem statement, an AI assistant, and your code editor. OffByOne brings problem import, an integrated code editor, code execution, and contextual AI help into a single workspace — so you can stay focused during practice and contest prep.

🔗 **Live demo:** [offbyone-kappa.vercel.app](https://offbyone-kappa.vercel.app)

---

## ✨ Features

- **Problem Import** — pull in problems directly from LeetCode by URL (Codeforces support in progress)
- **Integrated Code Editor** — write and run code without leaving the platform
- **AI Assistant** — explain code, generate test cases, spot edge cases, find bugs, and get optimization suggestions
- **Project Workspace** — organize problems and solutions in one place

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router
**Backend:** Node.js, Express, MongoDB (Mongoose)
**AI:** Groq SDK
**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB connection string (local or Atlas)
- A Groq API key ([console.groq.com](https://console.groq.com))

### Backend setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in your own values
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
cp .env.example .env   # then fill in your own values
npm run dev
```

The app will be running at `http://localhost:5173`, connected to a backend at `http://localhost:8000`.

---

## 📁 Environment Variables

**Backend (`backend/.env`)**
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_random_secret
GROQ_API_KEY=your_groq_api_key
```

**Frontend (`frontend/.env`)**
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 🗺️ Roadmap

- [ ] Codeforces problem import
- [ ] User authentication UI (signup/login)
- [ ] Multi-language code execution support
- [ ] Contest mode / timer

---

## 📸 Screenshots

**Workspace**
![Workspace](./Screenshots/ss.workspace.png)

**LeetCode Problem Import**
![LeetCode Import](./Screenshots/ss.import.png)

**AI-Generated Test Cases**
![AI Test Cases](./Screenshots/ss.ai-test.png)

---

## 📝 License

This project is open source and available for learning purposes.


## Made by [Parth Sharma](https://www.linkedin.com/in/parth1307sharma/) · [GitHub](parth1306sharma)