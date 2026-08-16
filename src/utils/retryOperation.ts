export const retryOperation: any = async (fn: any, retries = 3, delay = 500) => {
  try {
    return await fn();
  } catch (err: any) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return retryOperation(fn, retries - 1, delay * 2);
  }
};
