export const zodToOpenAPI = (schema: any) => {
  if (!schema) return undefined;

  let target = schema;

  // ❌ OLD WRONG: body/query confusion
  if (schema?.shape?.body?.shape) target = schema.shape.body;
  else if (schema?.shape?.query?.shape) target = schema.shape.query;
  else if (schema?.shape?.params?.shape) target = schema.shape.params;

  if (!target?.shape) return undefined;

  const properties: any = {};
  const required: string[] = [];

  for (const key of Object.keys(target.shape)) {
    const field = target.shape[key];

    let type = "string";

    const t = field?._def?.typeName;

    if (t === "ZodNumber") type = "number";
    if (t === "ZodBoolean") type = "boolean";
    if (t === "ZodArray") type = "array";

    properties[key] = { type };

    if (!field.isOptional?.()) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    ...(required.length ? { required } : {}),
  };
};
