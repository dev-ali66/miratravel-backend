// class ApiError extends Error {
//   constructor(message, statusCode = 500, metadata = {}) {
//     super(message);
//     this.statusCode = statusCode;
//     this.status = `${statusCode}`.startsWith("5") ? "error" : "fail";
//     this.success = false;
//     this.data = null;
//     Object.assign(this, metadata);
//     this.isOperational = true;
//     Error.captureStackTrace(this, this.constructor);
//     this.name = this.constructor.name;
//   }
// }

// export default ApiError;

class ApiError extends Error {
  statusCode: any;
  status: any;
  success: any;
  data: any;
  isOperational: any;

  constructor(message: any, statusCode: any = 500, metadata: any = {}) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("5") ? "error" : "fail";
    this.success = false;
    this.data = null;

    Object.assign(this, metadata);

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

export default ApiError;
