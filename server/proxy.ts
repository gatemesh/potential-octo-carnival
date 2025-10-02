import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
let currentDeviceAPI = process.env.DEVICE_API || 'http://192.168.0.50'; // change or set env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../packages/web/dist');

// Serve static UI
app.use(express.static(distDir));

// Minimal body parser for JSON
app.use(express.json());

// Proxy API calls to device (keeps same path)
app.use('/api', createProxyMiddleware({
  target: currentDeviceAPI,
  changeOrigin: true,
  router: () => currentDeviceAPI,
}));

// Endpoint to view/set current device API URL
app.get('/__device', (_req: express.Request, res: express.Response) => {
  res.json({ deviceApi: currentDeviceAPI });
});

app.post('/__device', (req: express.Request, res: express.Response) => {
  const { deviceApi } = req.body as { deviceApi?: string };
  if (!deviceApi || !/^https?:\/\//.test(deviceApi)) {
    return res.status(400).json({ error: 'Provide deviceApi like http://192.168.0.50' });
  }
  currentDeviceAPI = deviceApi;
  return res.json({ ok: true, deviceApi: currentDeviceAPI });
});

// SPA fallback
app.get('*', (_req: express.Request, res: express.Response) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GateMesh UI available on http://localhost:${PORT}`);
  console.log(`Proxying /api -> ${currentDeviceAPI}`);
});
