module.exports = {
  apps: [
    {
      name: 'scilog12',
      cwd: '/home/jit/scilog12',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3032',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: '3032',
      },
      out_file: '/home/jit/.pm2/logs/scilog12-out.log',
      error_file: '/home/jit/.pm2/logs/scilog12-err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
