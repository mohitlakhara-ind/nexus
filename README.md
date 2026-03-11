# 🌌 Nexus - Visual Mind Mapping & Intelligent Diagramming

> Nexus is a premium, full-stack collaborative platform designed to transform complex thoughts into structured visual intelligence. Build, analyze, and scale your ideas on an infinite canvas with real-time multiplayer support.

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://nexus-delta.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| 🧠 **Infinite Canvas** | Powered by **React Flow**, providing a limitless workspace for node-based architecture. |
| 👥 **Real-Time Sync** | **Socket.io** integration allows seamless collaboration with live cursor tracking. |
| 🛠️ **Semantic Nodes** | Specialized nodes for **SWOT**, **5 Whys**, and custom decision trees. |
| 🌓 **Premium UI** | Implementation of **Tailwind CSS v4** & **Framer Motion** for a sleek, glassmorphic look. |
| ⌨️ **Power User Tools** | Full **Command Palette (Ctrl+K)** and Markdown-to-Canvas pasting. |
| 🎮 **Gamified Flow** | Integrated XP system and user leveling to encourage deep work. |

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Engine:** React Flow v12 (Canvas manipulation)
- **Styling:** Tailwind CSS v4 + Framer Motion (Animations)
- **State:** Zustand (Atomic state management)
- **Real-time:** Socket.io-client

### Backend
- **Runtime:** Node.js (Express 5)
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT (JSON Web Tokens)
- **Intelligence:** Google Gemini AI integration

---

## 🛠️ Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Setup Repository
```bash
git clone https://github.com/yourusername/nexus.git
cd nexus
```

### 2. Backend Configuration
```bash
cd backend
npm install
```
Create `.env` in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
```
```bash
npm start
```

### 3. Frontend Configuration
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🗺️ Roadmap

- [x] **Phase 1:** Core Canvas & Basic Nodes
- [x] **Phase 2:** Real-time Collaboration (WebSockets)
- [x] **Phase 3:** AI-Powered Node Generation
- [/] **Phase 4:** Workspace Organization & Templates
- [ ] **Phase 5:** Mobile Responsive View & Exporting

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) and [Architecture Documentation](ARCHITECTURE.md) to get started.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Created with ❤️ by the Nexus Team.*
