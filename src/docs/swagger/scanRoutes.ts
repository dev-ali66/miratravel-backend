import { getMountedRoutes } from "./routeRegistry.js";

export const scanRoutes = () => {
  const result: any[] = [];
  const mounted = getMountedRoutes();

  for (const m of mounted) {
    const stack = m.router.stack || [];

    stack.forEach((layer: any) => {
      if (!layer.route) return;

      const route = layer.route;
      const method = Object.keys(route.methods)[0].toLowerCase();

      // -----------------------------
      // PATH PARAMS
      // -----------------------------
      const params: any[] = [];
      const matches = route.path.match(/:([^/]+)/g);

      if (matches) {
        for (const p of matches) {
          params.push({
            name: p.replace(":", ""),
            in: "path",
            required: true,
            schema: { type: "string" },
          });
        }
      }

      // -----------------------------
      // SCHEMA DETECTION
      // -----------------------------
      let schema: any = null;
      let isFormData = false;

      route.stack.forEach((h: any) => {
        const handler = h.handle;

        if (handler?.__zodSchema && !schema) {
          schema = handler.__zodSchema;
        }

        if (handler?.__isFormData) {
          isFormData = true;
        }
      });

      result.push({
        method: method.toLowerCase(),
        path: m.prefix + route.path,
        tag: m.prefix.replace("/api/v1/", ""),
        schema,
        params,
        isFormData,
      });
    });
  }

  return result;
};
