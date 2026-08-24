import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addYears } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMeAdmin!23", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pruevit.com" },
    update: {},
    create: {
      email: "admin@pruevit.com",
      name: "Pruevit Admin",
      passwordHash,
      role: Role.ADMIN,
      organization: "Pruevit",
    },
  });

  const attorneyHash = await bcrypt.hash("AttorneyDemo!23", 12);
  await prisma.user.upsert({
    where: { email: "attorney@example.com" },
    update: {},
    create: {
      email: "attorney@example.com",
      name: "Demo Attorney",
      passwordHash: attorneyHash,
      role: Role.ATTORNEY,
      organization: "Demo Law Firm",
    },
  });

  console.log("Seeded admin:", admin.email);
  console.log("Login: admin@pruevit.com / ChangeMeAdmin!23");
  console.log("Demo attorney: attorney@example.com / AttorneyDemo!23");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
