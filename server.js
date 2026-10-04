/**
 * Intelligent Customer Complaint & Support Analysis System
 * Production Node.js Server for Vercel Container & Cloud Deployments
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 80;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Run build.js if public directory is missing
if (!fs.existsSync(PUBLIC_DIR)) {
  console.log('[Server] Public directory missing, running build.js...');
  require('./build.js');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const ROUTE_REWRITES = {
  '/': '/index.html',
  '/index': '/index.html',
  '/login': '/login.html',
  '/app': '/app.html',
  '/register': '/frontend/user/register.html',
  '/forgot-password': '/frontend/user/forgot-password.html',
  '/docs': '/documentation.html',
  '/admin': '/frontend/admin/dashboard.html',
  '/admin/': '/frontend/admin/dashboard.html',
  '/admin/dashboard': '/frontend/admin/dashboard.html',
  '/admin/complaints': '/frontend/admin/complaints.html',
  '/admin/analytics': '/frontend/admin/analytics.html',
  '/admin/users': '/frontend/admin/users.html',
  '/user': '/frontend/user/dashboard.html',
  '/user/': '/frontend/user/dashboard.html',
  '/user/dashboard': '/frontend/user/dashboard.html',
  '/user/submit': '/frontend/user/submit-complaint.html',
  '/user/track': '/frontend/user/track-complaints.html',
  '/user/profile': '/frontend/user/profile.html'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Health check endpoint
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      system: 'Intelligent Customer Complaint & Support Analysis System',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Reverse proxy /api requests to Spring Boot backend
  if (pathname.startsWith('/api/')) {
    const backendReq = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: '127.0.0.1:8080'
      }
    }, (backendRes) => {
      res.writeHead(backendRes.statusCode, backendRes.headers);
      backendRes.pipe(res);
    });

    backendReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Backend Unavailable',
        message: 'Spring Boot backend is offline or starting up on port 8080'
      }));
    });

    req.pipe(backendReq);
    return;
  }

  // Exact rewrite matching
  if (ROUTE_REWRITES[pathname]) {
    pathname = ROUTE_REWRITES[pathname];
  }

  // Path resolution
  let filePath = path.join(PUBLIC_DIR, pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check if target is a directory, append index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Check with .html appended if extension missing
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  // Serve file if found
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Fallback to index.html for client-side single page navigation
  const fallbackPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(fallbackPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(fallbackPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Intelligent Customer Complaint System running on http://0.0.0.0:${PORT}`);
});
