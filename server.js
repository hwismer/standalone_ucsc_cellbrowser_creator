const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'cb');

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

function send416(res, size) {
  res.writeHead(416, {
    'Content-Range': `bytes */${size}`,
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('Range Not Satisfiable');
}

function serveFile(req, res, filePath, stat) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const size = stat.size;
  const range = req.headers.range;

  res.setHeader('Content-Type', contentType);
  res.setHeader('Accept-Ranges', 'bytes');

  if (!range) {
    res.writeHead(200, { 'Content-Length': size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return send416(res, size);

  let start = match[1] === '' ? null : Number(match[1]);
  let end = match[2] === '' ? null : Number(match[2]);

  if (start === null && end === null) return send416(res, size);

  if (start === null) {
    // suffix range: bytes=-500 means last 500 bytes
    const suffixLen = end;
    if (!Number.isFinite(suffixLen) || suffixLen <= 0) return send416(res, size);
    start = Math.max(size - suffixLen, 0);
    end = size - 1;
  } else {
    if (!Number.isFinite(start) || start < 0) return send416(res, size);
    if (end === null || !Number.isFinite(end) || end >= size) end = size - 1;
  }

  if (start > end || start >= size) return send416(res, size);

  res.writeHead(206, {
    'Content-Length': end - start + 1,
    'Content-Range': `bytes ${start}-${end}/${size}`,
  });

  if (req.method === 'HEAD') return res.end();

  fs.createReadStream(filePath, { start, end }).pipe(res);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    return send404(res);
  }

  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.resolve(root, '.' + urlPath);

  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    return send404(res);
  }

  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) return send404(res);
    serveFile(req, res, filePath, stat);
  });
});

server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  if (process.send) process.send({ port });
});
