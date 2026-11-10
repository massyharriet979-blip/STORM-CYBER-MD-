module.exports = { apps: [{ name: 'STORM-CYBER-MD', script: 'index.js', instances: 1, autorestart: true, watch: false, max_memory_restart: '900M', restart_delay: 3000, max_restarts: 10 }] };
