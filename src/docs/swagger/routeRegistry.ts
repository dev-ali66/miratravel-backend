const mountedRoutes: any[] = [];

export const mount = (app: any, prefix: string, router: any) => {
  mountedRoutes.push({ prefix, router });
  app.use(prefix, router);
};

export const getMountedRoutes = () => mountedRoutes;