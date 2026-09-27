const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const itemsToCopy = [
  'index.html',
  'login.html',
  'app.html',
  'manifest.json',
  'css',
  'js',
  'frontend'
];

itemsToCopy.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(targetDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`Copied ${item} -> public/${item}`);
  }
});

console.log('Vercel Build Success: public directory populated with all application assets.');
