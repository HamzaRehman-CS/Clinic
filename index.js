import http from 'node:http';
import handler from './server.mjs';

export default handler;

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  http.createServer(handler).listen(PORT, '127.0.0.1', () => console.log(`Local: http://localhost:${PORT}`));
}
