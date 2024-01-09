`
  npm install pm2 -g
  npm install
`
pm2 start process.js --name "process" --no-autorestart

pm2 start start.js --name "start" --no-autorestart
