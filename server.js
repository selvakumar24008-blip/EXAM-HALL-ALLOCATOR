/**
 * Local Development Server for Exam Hall Allocator System
 * Serves static assets from public/ and routes API requests to api/ handlers.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Map API routes to serverless handler files
const apiRoutes = {
  '/api/students': require('./api/students'),
  '/api/halls': require('./api/halls'),
  '/api/allocate': require('./api/allocate'),
  '/api/search': require('./api/search'),
  '/api/reports': require('./api/reports'),
  '/api/sample-data': require('./api/sample-data'),
  '/api/reset': require('./api/reset'),
  '/api/export': require('./api/export')
};

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enhance res with helper methods (compatible with Vercel serverless functions)
  res.status = function (statusCode) {
    res.statusCode = statusCode;
    return res;
  };
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  res.send = function (data) {
    res.end(data);
  };

  // Check if API route
  const apiHandler = apiRoutes[pathname];
  if (apiHandler) {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });
    req.on('end', () => {
      req.query = parsedUrl.query;
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = bodyData;
      }
      apiHandler(req, res);
    });
    return;
  }

  // Serve static files
  let safePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎓 EXAM HALL ALLOCATOR SYSTEM (Web & API Server)`);
  console.log(`🚀 Running locally at: http://localhost:${PORT}`);
  console.log(`📦 Vercel-ready serverless backend & static frontend`);
  console.log(`====================================================`);
});
