# 🤝 Contributing to Nexus

First off, thank you for considering contributing to Nexus! It's people like you that make Nexus a great tool for everyone.

---

## 🚩 Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/yourusername/nexus.git
cd nexus
```

### 2. Environment Setup
- Ensure you have **Node.js v18+** installed.
- Set up your `.env` files in both `backend/` and `frontend/` (if applicable).
- Run `npm install` in both directories.

### 3. Branching Strategy
- `main`: Production-ready code.
- `develop`: Ongoing feature development.
- Feature branches: `feat/feature-name` or `fix/bug-name`.

---

## 💻 Development Workflow

1. **Pick an Issue:** Find an open issue or create one to discuss your proposed changes.
2. **Create a Branch:** `git checkout -b feat/your-feature`.
3. **Write Code:** Follow our coding standards (see below).
4. **Test:** Ensure your changes don't break existing functionality. Run `npm run lint`.
5. **Commit:** Use descriptive commit messages (e.g., `feat: add markdown export support`).
6. **Push & PR:** Push to your fork and submit a Pull Request to the `develop` branch.

---

## 🎨 Coding Standards

- **React:** Use Functional Components with Hooks.
- **Styling:** Use **Tailwind CSS v4** utility classes. Avoid inline styles or complex CSS-in-JS.
- **State:** Use **Zustand** for global state; `useState` for local component state.
- **Consistency:** Follow the existing Prettier/ESLint configurations.

---

## 📜 Pull Request Guidelines

- Provide a clear description of the changes.
- Include screenshots or GIFs for UI/UX changes.
- Tag relevant issues (e.g., `Closes #123`).
- Ensure all CI/CD checks pass.

---

## 💬 Community & Support

- Open an [Issue](https://github.com/yourusername/nexus/issues) for bugs.
- Start a [Discussion](https://github.com/yourusername/nexus/discussions) for feature ideas.

*Happy Coding!* 🚀
