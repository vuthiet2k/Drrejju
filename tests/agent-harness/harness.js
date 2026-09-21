/**
 * tests/agent-harness/harness.js — Local Server Orchestration for Agent Verification
 */
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function pingServer(port, maxTries = 30, interval = 200) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const check = () => {
      tries++;
      const req = http.get(`http://localhost:${port}/`, (res) => {
        if (res.statusCode === 200) resolve(true);
        else if (tries >= maxTries) reject(new Error(`Server returned status ${res.statusCode}`));
        else setTimeout(check, interval);
      });
      req.on('error', () => {
        if (tries >= maxTries) reject(new Error(`Server failed to start on port ${port} after ${maxTries * interval}ms`));
        else setTimeout(check, interval);
      });
      req.end();
    };
    check();
  });
}

async function startDevServer(port = 3050) {
  console.log(`[Harness] Spawning dev-server.js on port ${port}...`);
  const env = { ...process.env, PORT: String(port), WS_PORT: String(port + 1) };
  const child = spawn('node', ['dev-server.js'], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });

  child.stderr.on('data', d => {
    const msg = d.toString();
    if (!msg.includes('ExperimentalWarning')) console.error(`[DevServer:err] ${msg.trim()}`);
  });

  await pingServer(port);
  console.log(`[Harness] dev-server.js is ONLINE at http://localhost:${port}/`);

  return {
    port,
    url: `http://localhost:${port}`,
    close: () => {
      console.log(`[Harness] Shutting down dev-server on port ${port}...`);
      child.kill('SIGTERM');
    }
  };
}

module.exports = { startDevServer, pingServer };
