import AuthHelper from "../../../src/utils/auth.helper.js";
import prisma from "../../config/prisma.js";

export const seed = async ({
  email = "admin@dev.com",
  password = "Pa$$w0rd.",
} = {}) => {
  await prisma.$transaction(
    async (tx: any) => {
      //  Permissions
      const permissionsData = [
        // admin
        { action: "CREATE", resource: "*", scope: "ANY" },
        { action: "READ", resource: "*", scope: "ANY" },
        { action: "UPDATE", resource: "*", scope: "ANY" },
        { action: "DELETE", resource: "*", scope: "ANY" },
        // userInfo
        { action: "CREATE", scope: "OWN" },
        { action: "READ", scope: "OWN" },
        { action: "UPDATE", scope: "OWN" },
        { action: "DELETE", scope: "OWN" },

        // wishlist
        { action: "CREATE", resource: "wishlist", scope: "OWN" },
        { action: "READ", resource: "wishlist", scope: "OWN" },
        { action: "UPDATE", resource: "wishlist", scope: "OWN" },
        { action: "DELETE", resource: "wishlist", scope: "OWN" },
      ];

      // create each permission if not exists
      for (const p of permissionsData) {
        let perm = await tx.permission.findFirst({
          where: {
            action: p.action as any,
            resource: p.resource,
            scope: p.scope as any,
          },
        });
        if (!perm) {
          perm = await tx.permission.create({ data: p as any });
        }
      }

      // fetch permissions to connect to roles
      const anyPerms = await tx.permission.findMany({
        where: { scope: "ANY" },
      });
      const ownPerms = await tx.permission.findMany({
        where: { scope: "OWN" },
      });

      //  Roles
      let adminRole = await tx.role.findUnique({ where: { name: "ADMIN" } });
      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            name: "ADMIN",
            permissions: { connect: anyPerms.map((p: any) => ({ id: p.id })) },
          },
        });
      }

      await tx.role.upsert({
        where: { name: "MANAGER" },
        create: {
          name: "MANAGER",
          permissions: {
            connect: ownPerms.map((p: any) => ({ id: p.id })),
          },
        },
        update: {
          permissions: {
            connect: ownPerms.map((p: any) => ({ id: p.id })),
          },
        },
      });
      await tx.role.upsert({
        where: { name: "USER" },
        create: {
          name: "USER",
          permissions: {
            connect: ownPerms.map((p: any) => ({ id: p.id })),
          },
        },
        update: {
          permissions: {
            connect: ownPerms.map((p: any) => ({ id: p.id })),
          },
        },
      });
      await tx.role.upsert({
        where: { name: "EDITOR" },
        create: {
          name: "EDITOR",
          permissions: {
            connect: ownPerms.map((p: any) => ({ id: p.id })),
          },
        },
        update: {
          permissions: {
            connect: ownPerms.map((p: any) => ({ id: p.id })),
          },
        },
      });

      // Admin User
      let adminUser = await tx.auth.findUnique({ where: { email } });
      if (!adminUser) {
        const hashedPassword = await AuthHelper.hashPassword(password);
        adminUser = await tx.auth.create({
          data: {
            email,
            password: hashedPassword,
            roles: { connect: [{ id: adminRole.id }] },
            isVerified: true,
            otp: null,
            otpExpiresAt: null,
            emailToken: null,
            userPersonalInfo: {
              create: {},
            },
            userSettings: {
              create: {},
            },
          },
        });
      }
    },
    {
      maxWait: 60000, // max time to wait for transaction to start
      timeout: 60000, // transaction execution timeout
    },
  );

  console.log("✅ Seed completed (duplicates avoided)!");
};

// Run if this file is executed directly
if (process.argv[1].endsWith("seed.js")) {
  seed();
}
