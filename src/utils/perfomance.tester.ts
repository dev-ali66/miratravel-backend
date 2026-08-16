export const requestProfilerMiddleware = (req: any, _res: any, next: any) => {
  const start = performance.now();
  let last = start;

  req.profiler = {
    step: (label: string) => {
      const now = performance.now();
      const diff = ((now - last) / 1000).toFixed(4);

      console.log(`⏱ ${req.method} ${req.originalUrl} - ${label}: ${diff} sec`);

      last = now;
    },

    end: () => {
      const now = performance.now();
      const total = ((now - start) / 1000).toFixed(4);

      console.log(`🔥 ${req.method} ${req.originalUrl} TOTAL: ${total} sec`);
    },
  };

  next();
};
