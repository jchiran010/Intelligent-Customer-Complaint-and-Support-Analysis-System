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
  'documentation.html',
  'Intelligent_Customer_Complaint_System_Comprehensive_Documentation.pdf',
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

// Also create direct shortcuts for /admin and /user routes for flat cloud hosting compatibility
const userSrc = path.join(__dirname, 'frontend', 'user');
const adminSrc = path.join(__dirname, 'frontend', 'admin');
if (fs.existsSync(userSrc)) {
  fs.cpSync(userSrc, path.join(targetDir, 'user'), { recursive: true, force: true });
  console.log('Copied frontend/user -> public/user');
}
if (fs.existsSync(adminSrc)) {
  fs.cpSync(adminSrc, path.join(targetDir, 'admin'), { recursive: true, force: true });
  console.log('Copied frontend/admin -> public/admin');
}

console.log('Vercel Build Success: public directory populated with all application assets.');
