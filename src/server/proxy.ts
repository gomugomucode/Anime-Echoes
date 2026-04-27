import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

// Simple proxy endpoint: /proxy?url=ENCODED_URL
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    res.status(400).send('Missing url parameter');
    return;
  }
  try {
    const response = await fetch(targetUrl);
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', contentType);
    res.send(buffer);
  } catch (err) {
    console.error('Proxy fetch error:', err);
    res.status(500).send('Failed to fetch the resource');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CORS proxy server listening on http://localhost:${PORT}`);
});
