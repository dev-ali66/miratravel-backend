import { PrismaClient } from "@prisma/client";
import { registerPrismaLogger } from "../logger/prisma.logger.js";


declare global {
  var prisma: PrismaClient | undefined;
}


const createPrismaClient = () => {

  const client = new PrismaClient({

    log:
      process.env.NODE_ENV === "development"

        ? [
          {
            emit: "event",
            level: "query",
          },
          {
            emit: "event",
            level: "info",
          },
          {
            emit: "event",
            level: "warn",
          },
          {
            emit: "event",
            level: "error",
          },
        ]

        : [
          {
            emit: "event",
            level: "warn",
          },
          {
            emit: "event",
            level: "error",
          },
        ],

  });


  registerPrismaLogger(client);


  return client;

};



const prisma =
  global.prisma ??
  createPrismaClient();



if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}


export default prisma;

// /* eslint-disable no-undef */
// import { PrismaClient } from "@prisma/client";

// declare global {
//   var prisma: PrismaClient | undefined;
// }

// let prisma: PrismaClient;

// if (!global.prisma) {
//   prisma = new PrismaClient({
//     log:
//       process.env.NODE_ENV === "development"
//         ? [
//             { emit: "event", level: "query" },
//             { emit: "event", level: "error" },
//             { emit: "event", level: "warn" },
//             { emit: "event", level: "info" },
//           ]
//         : [
//             { emit: "event", level: "error" },
//             { emit: "event", level: "warn" },
//           ],
//   });

//   // Event listeners
//   if (process.env.NODE_ENV === "development") {
//     (prisma as any)?.$on("query", (e: any) => {
//       console.log(`Query: ${e.query}`);
//       console.log(`Params: ${e.params}`);
//       console.log(`Duration: ${e.duration}ms`);
//     });
//   }

//   (prisma as any)?.$on("error", (e: any) => {
//     console.log(`Prisma Error: ${e.message}`);
//   });

//   (prisma as any)?.$on("warn", (e: any) => {
//     console.log(`Prisma Warning: ${e.message}`);
//   });

//   global.prisma = prisma;
// } else {
//   prisma = global.prisma;
// }

// export default prisma;
