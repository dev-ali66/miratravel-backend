export async function clearTestDb() {
  try {
    console.log("🧹 Clearing test users and all related data...");

    const testUsers: any = await prisma?.auth.findMany({
      where: {
        email: {
          in: ["admin1@test.com", "partner1@test.com", "partner2@test.com"],
        },
      },
      select: { id: true },
    });

    const userIds = testUsers.map((u: any) => u.id);
    if (!userIds.length) {
      console.log("⚠️ No test users found to delete");
      return;
    }

    const tables = (await prisma?.$queryRawUnsafe(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND (column_name = 'userId' OR column_name = 'user')
    `)) as { table_name: string; column_name: string }[];

    for (const t of tables) {
      const table = t.table_name;
      const column = t.column_name;
      const idsList = userIds.map((id: any) => `'${id}'`).join(",");
      // console.log(`🗑️ Deleting from ${table} where ${column} in (${userIds.join(",")})`);
      await prisma?.$executeRawUnsafe(`
        DELETE FROM "${table}" WHERE "${column}" IN (${idsList});
      `);
    }

    await prisma?.auth.deleteMany({ where: { id: { in: userIds } } });

    console.log(`✅ Deleted ${userIds.length} test users and all related data`);
  } catch (err: any) {
    console.error("❌ Failed to clear test DB:", err);
    throw err; // <-- throw instead of process.exit
  }
}

// CLI runner
if (process.argv[1].endsWith("clearTestDb.js")) {
  clearTestDb().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
