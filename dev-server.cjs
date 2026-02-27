process.chdir(__dirname);
const { execSync } = require('child_process');
execSync('node node_modules/vite/bin/vite.js --port 5180 --strictPort --host 127.0.0.1', {
  stdio: 'inherit',
  env: { ...process.env, PATH: 'C:\\Program Files\\nodejs;' + process.env.PATH }
});
