const http = require('http');

const request = http.get({
  hostname: '127.0.0.1',
  port: Number(process.env.PORT) || 5000,
  path: '/api/health',
  timeout: 2500
}, (response) => {
  response.resume();
  process.exit(response.statusCode === 200 ? 0 : 1);
});

request.on('timeout', () => request.destroy(new Error('timeout')));
request.on('error', () => process.exit(1));
