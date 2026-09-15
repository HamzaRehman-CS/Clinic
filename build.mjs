import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const dist = path.resolve(root, 'dist');

console.log('[build] Preparing production build in dist/...');

// Ensure dist directory exists
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy assets
copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));

// 2. Copy vendor libraries
copyDir(path.join(root, 'vendor'), path.join(dist, 'vendor'));

// 3. Copy js directory to dist/js
copyDir(path.join(root, 'js'), path.join(dist, 'js'));

// 4. Copy root files
fs.copyFileSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));
fs.copyFileSync(path.join(root, 'style.css'), path.join(dist, 'style.css'));

// 5. Also copy flat app.js and dna.js to dist root for backwards compatibility
fs.copyFileSync(path.join(root, 'js', 'app.js'), path.join(dist, 'app.js'));

let dnaContent = fs.readFileSync(path.join(root, 'js', 'dna.js'), 'utf8');
let distDnaContent = dnaContent.replace("from '../vendor/three.module.js'", "from './vendor/three.module.js'");
fs.writeFileSync(path.join(dist, 'dna.js'), distDnaContent, 'utf8');

console.log('[build] Production static assets successfully prepared in dist/.');
