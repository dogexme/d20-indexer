`
  npm install pm2 -g
`

`
  npm install
`

`init database and config.json`

pm2 start process.js --name "process" --no-autorestart

pm2 start start.js --name "start" --no-autorestart
