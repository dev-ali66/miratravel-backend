// utils/extractfileRemove.js
export const extractfileRemove = (
  input: any,
  domain = "res.cloudinary.com",
) => {
  if (!input) return [];
  let result: any = [];

  // parse stringified JSON arrays
  const parseIfString = (data: any) => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e: any) {
        return data; // not JSON, keep as string
      }
    }
    return data;
  };

  const traverse = (data: any) => {
    if (Array.isArray(data)) {
      data.forEach((item) => traverse(item));
    } else if (data && typeof data === "object") {
      Object.values(data).forEach((value) => traverse(value));
    } else if (typeof data === "string" && data.includes(domain)) {
      result.push(data.trim());
    }
  };

  traverse(input);
  return result;
};

// utils/extractfileRemove.js
// export const extractfileRemove = (input, externalDomain = "res.cloudinary.com") => {
//     if (!input) return [];
//     let result = [];

//     // parse stringified JSON arrays/objects
//     const parseIfString = (data) => {
//         if (typeof data === 'string') {
//             try {
//                 return JSON.parse(data);
//             } catch (e:any) {
//                 return data; // not JSON, keep as string
//             }
//         }
//         return data;
//     };

//     const traverse = (data) => {
//         data = parseIfString(data); // <-- ensure stringified JSON is parsed

//         if (Array.isArray(data)) {
//             data.forEach(item => traverse(item));
//         } else if (data && typeof data === 'object') {
//             Object.values(data).forEach(value => traverse(value));
//         } else if (typeof data === 'string' && data.includes(externalDomain)) {
//             result.push(data.trim());
//         }
//     };

//     traverse(input);
//     return result;
// };
