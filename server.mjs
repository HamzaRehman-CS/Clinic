import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

export async function handler(req, res) {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = pathname === '/' ? '/index.html' : pathname;
    let file = path.resolve(root, '.' + target);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let body;
    try {
      body = await readFile(file);
    } catch {
      file = path.resolve(root, 'dist', '.' + target);
      body = await readFile(file);
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

export default handler;

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  http.createServer(handler).listen(PORT, '127.0.0.1', () => console.log(`Local: http://localhost:${PORT}`));
}
