# SmartCampus ERP • Agent Guidelines

## 🔄 Automatic GitHub Sync Policy (MANDATORY)
Whenever any file in this repository is modified, created, or deleted:
1. Always build the project to confirm zero syntax/compilation errors (`npm run build`).
2. Automatically run:
   ```bash
   git add .
   git commit -m "feat/fix: <descriptive message>"
   git push origin main
   ```
3. Confirm to the user that changes are synchronized to: `https://github.com/adiishinde1777/SmartCampus`.
4. Never leave unstaged or unpushed changes at the end of a response.
