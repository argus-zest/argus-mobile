# Contributing to Argus Mobile

Thank you for contributing to **Argus Mobile**! We want to make collaborating as smooth and fun as possible.

---

## 🛠️ Development Setup

1. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/argus-mobile.git
   cd argus-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development**:
   ```bash
   npm run dev
   ```

---

## 🌿 Branching Strategy

- **`main`**: Production-ready branch. All merged PRs should be stable.
- **`feature/<feature-name>`**: For new screens or components (e.g. `feature/hazard-camera-sheet`).
- **`fix/<bug-name>`**: For bug fixes.
- **`design/<ui-update>`**: For style and design updates.

---

## 📝 Pull Request Checklist

Before submitting a Pull Request:
1. Ensure your code passes TypeScript checks:
   ```bash
   npm run build
   ```
2. Test on both desktop mobile emulation and a real phone device if possible.
3. Keep pull requests focused on a single feature or screen.
4. Include a screenshot or recording in the PR description!

---

## 💬 Teammate Questions & Communication

If you have questions about backend endpoints, mock payloads, or civic logic:
- Check [API_REFERENCE.md](./API_REFERENCE.md)
- Check [MOBILE_APP_SPEC.md](./MOBILE_APP_SPEC.md)
- Open a GitHub Discussion or Issue in this repository!
