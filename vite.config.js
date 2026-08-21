import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sendMetaCapi } from './api/lib/meta-capi.js';
import { handleQuizSubmit } from './api/lib/quiz-submit.js';

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('error', reject);
    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function apiPlugin(env) {
  return {
    name: 'funnel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== '/api/submit' && url !== '/api/capi') {
          next();
          return;
        }
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== 'POST') {
          jsonResponse(res, 405, { ok: false, error: 'Method not allowed' });
          return;
        }
        try {
          const fields = await readJsonBody(req);
          if (url === '/api/submit') {
            if (!fields?.email || !fields?.name) {
              jsonResponse(res, 400, { ok: false, error: 'name and email are required' });
              return;
            }
            const result = await handleQuizSubmit(fields, env, req);
            jsonResponse(res, result.ok ? 200 : 502, result);
            return;
          }
          const result = await sendMetaCapi(env, req, fields);
          jsonResponse(res, result.ok ? 200 : 502, result);
        } catch (err) {
          console.error('[api] failed', err);
          jsonResponse(res, 500, { ok: false, error: 'Request failed' });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), apiPlugin(env)],
    build: {
      target: 'es2015',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('libphonenumber-js')) return 'phone';
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
              return 'react-vendor';
            }
          },
        },
      },
    },
  };
});
