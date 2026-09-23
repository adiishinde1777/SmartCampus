import { spawn } from 'child_process';

console.log('========================================================');
console.log('🚀 Starting SmartCampus Full-Stack Services...');
console.log('   • Backend API Server: http://localhost:5000');
console.log('   • Frontend Web App:   http://localhost:3000');
console.log('========================================================\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Backend Express & MySQL Server
const backend = spawn(npmCmd, ['--prefix', 'backend', 'start'], {
  stdio: 'inherit',
  shell: true
});

// 2. Start Frontend Vite Dev Server
const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

backend.on('close', (code) => {
  if (code !== 0) console.error(`Backend process exited with code ${code}`);
});

frontend.on('close', (code) => {
  if (code !== 0) console.error(`Frontend process exited with code ${code}`);
});

process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});
