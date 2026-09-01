module.exports = {
  apps: [
    {
      name: "marcus-backend",
      script: "./dist/index.js",
      instances: 2,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",

      env_production: {
        NODE_ENV: "production",
        PORT: 5013,
      },

      env_development: {
        NODE_ENV: "development",
        PORT: 5013,
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