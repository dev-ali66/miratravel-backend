import prisma from "../config/prisma.js";

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "JourneyWizardRequest" (
        "id" TEXT NOT NULL,
        "journeyTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "travelStyles" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "perfectFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "pace" TEXT,
        "comfortLevel" TEXT,
        "duration" TEXT,
        "budget" INTEGER,
        "budgetText" TEXT,
        "name" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "notes" TEXT,
        "status" TEXT NOT NULL DEFAULT 'NEW',
        "deletedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "JourneyWizardRequest_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Successfully created JourneyWizardRequest table in PostgreSQL!");
  } catch (err: any) {
    console.log("Table creation result:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
