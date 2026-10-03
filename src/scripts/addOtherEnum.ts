import prisma from "../config/prisma.js";

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "LocationType" ADD VALUE IF NOT EXISTS 'OTHER'`);
    console.log("Successfully added OTHER to LocationType enum in PostgreSQL!");
  } catch (err: any) {
    console.log("Migration status / info:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
