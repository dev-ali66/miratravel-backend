import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    csrfToken: () => string;
    auth?: any;
    token: any;
    profiler: any;
    modelName: any;
    action: any;
    requestId: string;
    correlationId: string;
    traceId: string;
    matchedPermissions: any;
    validated?: {
      body?: any;
      query?: any;
      params?: any;
    };
  }
}
