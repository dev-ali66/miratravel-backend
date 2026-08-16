import prisma from "../src/config/prisma?.js";
import AuthHelper from "../src/utils/auth.helper.js";

export const seedTestUsers = async () => {
  const hashedPassword = await AuthHelper.hashPassword("Password@1234");
  await prisma?.$transaction(async (tx) => {
    // Admin
    const admin = await tx.auth.create({
      data: {
        email: "admin1@test.com",
        password: hashedPassword,
        role: "admin",
        needPasswordChange: false,
        isVerified: true,
        status: "active",
      },
    });

    await tx.userPersonalInfo.create({
      data: {
        user: admin.id,
        name: "Admin User",
        phone: "000000000",
      },
    });

    // Partner 1
    const partner1 = await tx.auth.create({
      data: {
        email: "partner1@test.com",
        password: hashedPassword,
        role: "partner",
        needPasswordChange: false,
        isVerified: true,
        status: "active",
      },
    });

    await tx.userPersonalInfo.create({
      data: {
        user: partner1.id,
        name: "Partner One",
        phone: "000000001",
      },
    });

    // Partner 2
    const partner2 = await tx.auth.create({
      data: {
        email: "partner2@test.com",
        password: hashedPassword,
        role: "partner",
        needPasswordChange: false,
        isVerified: true,
        status: "active",
      },
    });

    await tx.userPersonalInfo.create({
      data: {
        user: partner2.id,
        name: "Partner Two",
        phone: "000000002",
      },
    });
  });

  console.log("✅ Test users seeded successfully");
};

// CLI runner
if (process.argv[1].endsWith("seedTestUsers.js")) {
  seedTestUsers();
}
