// Auto Git Sync Watcher
// Automatically watches for file changes and pushes to GitHub
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 SmartCampus Auto-Git-Sync active...');
console.log('Watching for changes in workspace to push to origin/main...');

let timeout = null;
let changedFiles = new Set();

const ignoredDirs = ['node_modules', '.git', 'dist', 'backend/node_modules', 'frontend/node_modules'];

function shouldIgnore(filename) {
  if (!filename) return true;
  return ignoredDirs.some(dir => filename.includes(dir)) ||
         filename.endsWith('.log') ||
         filename.includes('local_db.json');
}

function syncToGit() {
  const fileCount = changedFiles.size;
  changedFiles.clear();
  
  const timestamp = new Date().toLocaleString();
  const commitMsg = `auto-sync: updates as of ${timestamp}`;

  console.log(`\n📦 Staging & pushing ${fileCount} changed file(s)...`);
  
  exec('git add . && git commit -m "' + commitMsg + '" && git push origin main', (error, stdout, stderr) => {
    if (error) {
      if (stdout.includes('nothing to commit') || stderr.includes('nothing to commit')) {
        console.log('✓ Working tree clean, nothing new to push.');
      } else {
        console.warn('⚠️ Sync note:', stderr || error.message);
      }
      return;
    }
    console.log('🚀 Pushed successfully to GitHub!');
    console.log(stdout.trim());
  });
}

// Watch frontend, backend, scripts, package.json
['frontend', 'backend', 'scripts', 'package.json'].forEach((target) => {
  if (fs.existsSync(target)) {
    fs.watch(target, { recursive: true }, (eventType, filename) => {
      if (shouldIgnore(filename)) return;
      changedFiles.add(filename);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(syncToGit, 4000); // 4-second debounce
    });
  }
});
