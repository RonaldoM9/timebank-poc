// TimeHeroes — production server starter
// Bypasses "next start" CSS hash bug in Next.js 16.x
import next from 'next';
import http from 'http';
import { parse } from 'url';

process.env.PORT = process.env.PORT || '3096';
const port = parseInt(process.env.PORT, 10);
const app = next({ dev: false, dir: '.' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => handle(req, res, parse(req.url, true)))
    .listen(port, () => console.log(`✅ TimeHeroes ready on http://localhost:${port}`));
});
