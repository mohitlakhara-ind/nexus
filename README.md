# Nexus - Visual Mind Mapping & Diagramming

Nexus is a full-stack, collaborative mind-mapping and diagram-creation tool built for thinkers, planners, and teams. Map out your thoughts, analyze root causes, or design system architectures with an infinite canvas and real-time multiplayer support.

![Nexus Dashboard Demo](./assets/demo.png) *(Placeholder for screenshot)*

## Features

- 🧠 **Infinite Canvas:** Built on top of React Flow, allowing for limitless node-based diagrams.
- 👥 **Real-Time Collaboration:** Powered by Socket.io. See cursors move and nodes update instantly as your team works together.
- 🗃️ **Specialized Nodes:** Beyond basic shapes, Nexus includes tailored nodes for SWOT analyses, 5 Whys, and actionable Decision Trees.
- 🎨 **Theming & Gamification:** Light/Dark modes, beautifully crafted UI with Tailwind CSS, and user leveling (XP) for engagements!
- ⌨️ **Keyboard First:** Complete Command Palette (Ctrl+K) and Markdown import pasting for power users.

## Tech Stack

**Frontend:**
- React 19 (Vite)
- React Flow (Node/Canvas Engine)
- Tailwind CSS v4 & Framer Motion (Styling & Animation)
- Zustand (State Management)
- Socket.io Client

**Backend:**
- Node.js & Express
- MongoDB & Mongoose (Data Storage)
- JWT (Authentication)
- Socket.io (WebSocket Server)

## Running Locally

To run Nexus on your local machine, you will need Node.js and a MongoDB instance (local or Atlas) running.

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/nexus.git
cd nexus
```

### 2. Backend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` root:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexus
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Configuration
In a new terminal window, navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Nexus should now be running at `http://localhost:5173`.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any bugs or feature enhancements.

## License
MIT
