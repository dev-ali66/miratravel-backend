module.exports = {
  apps: [
    {
      name: "backend-miratravel",
      script: "./dist/index.js",
      instances: 2,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "512M",
      node_args: "--max-old-space-size=512 --expose-gc",
      kill_timeout: 5000,
      listen_timeout: 10000,

      env_production: {
        NODE_ENV: "production",
        PORT: 5011,
      },

      env_development: {
        NODE_ENV: "development",
        PORT: 5011,
      },

      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
