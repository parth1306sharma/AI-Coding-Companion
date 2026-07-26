# OffByOne

**Competitive Programming Assistant** — an AI-powered coding companion that imports problems directly from LeetCode and Codeforces, runs your code against real test cases, and gives you an AI co-pilot for explanations, bug-finding, and test-case generation — all inside a Monaco-based code editor.

## Features

- 🔗 **Import problems** directly from LeetCode / Codeforces URLs
- 📝 **Monaco code editor** with syntax highlighting and multi-language support (C++, Python, and more)
- ▶️ **Run code** against sample tests instantly with a live console
- 🤖 **AI chat assistant** — explain code, find bugs, optimize, generate edge cases, all in natural language
- 🧪 **AI-generated test cases** you can run and compare directly against your own output
- ⚡ Real-time verdicts (Passed / Failed / Error) with a clean console UI

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Monaco Editor |
| Backend | Node.js, Express, MongoDB |
| AI | Groq API |

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas connection string
- A Groq API key ([console.groq.com](https://console.groq.com))

### 1. Clone the repo

```bash
git clone https://github.com/parth1306sharma/offbyone.git
cd offbyone
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your own values:

```dotenv
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=ai-coding-companion
CORS_ORIGIN=*
JWT_SECRET=your_random_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app

Visit `http://localhost:5173` in your browser.

## Project Structure

```
offbyone/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── models/
│   │   └── utils/
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/
│       └── services/
└── README.md
```

## Live Demo

_[Add your deployed link here once available]_

## Screenshots

_[Add a screenshot or GIF here]_

## License

_[Add a license here, e.g. MIT — or remove this section if you don't want one]_