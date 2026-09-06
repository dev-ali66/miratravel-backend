const schemaRegistry = new Map();

export const registerSchema = (middleware: any, schema: any) => {
  schemaRegistry.set(middleware, schema);
};

export const getSchema = (middleware: any) => {
  return schemaRegistry.get(middleware);
};
