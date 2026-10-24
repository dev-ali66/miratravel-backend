import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const target = "w3ilqosvlwlrcsm82cqp";
  console.log(`Searching for "${target}" in MediaAsset...`);
  const asset = await prisma.mediaAsset.findFirst({
    where: { url: { contains: target } },
    include: { references: true },
  });
  console.log("MediaAsset found:", asset);

  // Search in all tables
  const cols: any[] = await prisma.$queryRaw`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb');
  `;

  console.log(`\nSearching across ${cols.length} columns in DB...`);
  for (const c of cols) {
    try {
      const q = `SELECT id, "${c.column_name}"::text AS val FROM "${c.table_name}" WHERE "${c.column_name}"::text LIKE '%${target}%' LIMIT 5;`;
      const res: any[] = await prisma.$queryRawUnsafe(q);
      if (res.length > 0) {
        console.log(`FOUND in table: ${c.table_name}, column: ${c.column_name}, rowId: ${res[0].id}`);
        console.log("Sample:", res[0].val.substring(0, 300));
      }
    } catch {
      // ignore
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
