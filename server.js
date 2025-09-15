const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname; // serve files from this folder
const PORT = Number(process.env.PORT) || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

function localIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
}

const server = http.createServer((req, res) => {
  try {
    // Normalize and prevent path traversal
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let safePath = path.normalize(urlPath).replace(/^([.][/\\])+/, '/');

    // Default to index.html for root
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';

    const filePath = path.join(ROOT, safePath);

    // Ensure the file is within ROOT
    if (!filePath.startsWith(ROOT)) {
      return notFound(res);
    }

    fs.stat(filePath, (err, stats) => {
      if (err) return notFound(res);
      if (stats.isDirectory()) {
        const indexFile = path.join(filePath, 'index.html');
        return fs.existsSync(indexFile) ? sendFile(res, indexFile) : notFound(res);
      }
      sendFile(res, filePath);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = localIPs();
  const list = ips.length ? ips : ['127.0.0.1'];
  console.log('Static server running from:', ROOT);
  for (const ip of list) {
    console.log(`- http://${ip}:${PORT}/`);
  }
  console.log('\nIf prompted by Windows Defender Firewall, allow access for Node.js.');
});

