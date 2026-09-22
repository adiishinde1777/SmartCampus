---
description: Automatically commit and push all code changes to GitHub on every turn
---

# Automatic GitHub Sync Policy

Whenever code changes, additions, fixes, or refactors are made in this repository:
1. Ensure the application compiles without errors (`npm run build`).
2. Stage all modifications: `git add .`
3. Commit with a descriptive conventional commit message: `git commit -m "..."`
4. Push immediately to GitHub: `git push origin main`
5. Report to the user the git commit hash and confirmation that changes are live on GitHub (`https://github.com/adiishinde1777/SmartCampus`).
