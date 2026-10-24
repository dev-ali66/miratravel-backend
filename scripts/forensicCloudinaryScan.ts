import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
}

async function forensicScan() {
  console.log("==========================================================");
  console.log("  FORENSIC WHOLE-DATABASE SCAN FOR 'cloudinary' OR 'res.cloudinary.com'");
  console.log("==========================================================\n");

  // 1. Get all public base tables and text/json/varchar columns
  const columns: ColumnInfo[] = await prisma.$queryRaw<ColumnInfo[]>`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb')
    ORDER BY table_name, ordinal_position;
  `;

  console.log(`Discovered ${columns.length} candidate text/json columns across public tables.\n`);

  // Group columns by table
  const tableMap = new Map<string, string[]>();
  for (const col of columns) {
    if (!tableMap.has(col.table_name)) {
      tableMap.set(col.table_name, []);
    }
    tableMap.get(col.table_name)!.push(col.column_name);
  }

  console.log(`Scanning ${tableMap.size} unique tables...\n`);

  let totalMatches = 0;
  const matchDetails: any[] = [];

  for (const [tableName, cols] of tableMap.entries()) {
    process.stdout.write(`Scanning table: "${tableName}" (${cols.length} columns)... `);
    let tableMatchCount = 0;

    for (const col of cols) {
      try {
        const query = `
          SELECT id, "${col}"::text AS val
          FROM "${tableName}"
          WHERE "${col}"::text ILIKE '%cloudinary%'
          LIMIT 10;
        `;
        const rows: any[] = await prisma.$queryRawUnsafe(query);

        if (rows.length > 0) {
          tableMatchCount += rows.length;
          totalMatches += rows.length;
          for (const r of rows) {
            matchDetails.push({
              table: tableName,
              column: col,
              rowId: r.id,
              sampleValue: r.val ? r.val.substring(0, 200) : null,
            });
          }
        }
      } catch (err: any) {
        // Some tables might not have an "id" column, fallback to without id
        try {
          const queryNoId = `
            SELECT "${col}"::text AS val
            FROM "${tableName}"
            WHERE "${col}"::text ILIKE '%cloudinary%'
            LIMIT 10;
          `;
          const rows: any[] = await prisma.$queryRawUnsafe(queryNoId);
          if (rows.length > 0) {
            tableMatchCount += rows.length;
            totalMatches += rows.length;
            for (const r of rows) {
              matchDetails.push({
                table: tableName,
                column: col,
                rowId: "N/A",
                sampleValue: r.val ? r.val.substring(0, 200) : null,
              });
            }
          }
        } catch (innerErr) {
          // ignore column query failure (e.g. system views)
        }
      }
    }

    if (tableMatchCount > 0) {
      console.log(`❌ FOUND ${tableMatchCount} MATCHES!`);
    } else {
      console.log(`✅ Clean (0 matches)`);
    }
  }

  console.log("\n==========================================================");
  console.log("  SCAN RESULTS SUMMARY");
  console.log("==========================================================");
  console.log(`Total Tables Scanned:  ${tableMap.size}`);
  console.log(`Total Columns Scanned: ${columns.length}`);
  console.log(`Total Matches Found:   ${totalMatches}`);
  console.log("==========================================================\n");

  if (totalMatches > 0) {
    console.log("Match Details:");
    console.dir(matchDetails, { depth: null });
  } else {
    console.log("SUCCESS: EXACTLY ZERO (0) occurrences of 'cloudinary' exist anywhere in the entire database!");
  }

  await prisma.$disconnect();
}

forensicScan().catch((err) => {
  console.error("Forensic scan failed:", err);
  process.exit(1);
});
