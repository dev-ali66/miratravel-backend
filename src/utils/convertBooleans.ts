// export const convertBooleans :any = (obj:any) => {
//   if (Array.isArray(obj)) {
//     return obj.map((item) => convertBooleans(item));
//   }

//   if (obj && typeof obj === "object") {
//     const result = {};
//     for (const key in obj) {
//       if (!obj.hasOwnProperty(key)) continue;
//       result[key] = convertBooleans(obj[key]);
//     }
//     return result;
//   }

//   if (obj === "true") return true;
//   if (obj === "false") return false;

//   return obj;
// }

export const convertBooleans = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertBooleans(item));
  }

  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      result[key] = convertBooleans(obj[key]);
    }

    return result;
  }

  if (obj === "true") return true;
  if (obj === "false") return false;

  return obj;
};
