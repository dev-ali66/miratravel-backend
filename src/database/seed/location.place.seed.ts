// import { PrismaClient, LocationType } from "@prisma/client";
// import locations from "../data/postman/location/location.js";

// const prisma = new PrismaClient();

// const sleep = (ms: number) =>
//   new Promise((resolve) => setTimeout(resolve, ms));

// async function main() {
//   console.log(locations.length);
//   console.log(`Importing ${locations.length} locations...`);

//   for (const location of locations) {
//     const locationType = location.type as LocationType;

//     // Check parent exists in database
//     if (location.parentId) {
//       const parent = await prisma.location.findUnique({
//         where: {
//           id: location.parentId,
//         },
//         select: {
//           id: true,
//           name: true,
//         },
//       });

//       if (!parent) {
//         throw new Error(
//           `Parent location not found in database for "${location.name}". Parent ID: ${location.parentId}`
//         );
//       }
//     }

//     // Upsert location
//     await prisma.location.upsert({
//       where: {
//         id: location.id,
//       },

//       update: {
//         name: location.name,
//         slug: location.slug,
//         type: locationType,
//         parentId: location.parentId ?? null,
//         geoData: location.geoData ?? null,
//         metadata: location.metadata ?? null,
//         data: location.data ?? null,
//       },

//       create: {
//         id: location.id,
//         name: location.name,
//         slug: location.slug,
//         type: locationType,
//         parentId: location.parentId ?? null,
//         geoData: location.geoData ?? null,
//         metadata: location.metadata ?? null,
//         data: location.data ?? null,
//       },
//     });

//     console.log(
//       `✓ ${locationType.padEnd(12)} ${location.name}`
//     );

//     await sleep(1000);
//   }

//   console.log(
//     `\nSuccessfully imported ${locations.length} locations!`
//   );
// }

// main()
//   .catch((error) => {
//     console.error("\nFailed to import locations:");
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });