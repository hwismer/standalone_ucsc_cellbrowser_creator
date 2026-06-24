const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'cb');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gz': 'application/gzip',
  '.bgz': 'application/gzip',
};

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(root, urlPath);
  if (!filePath.startsWith(root)) return send404(res);

  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) return send404(res);

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  if (process.send) process.send({ port });
});
