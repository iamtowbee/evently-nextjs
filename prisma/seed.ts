const { PrismaClient } = require("@prisma/client");
const { readFileSync } = require("fs");
const { join } = require("path");

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the SQL file
    const sqlFile: string = readFileSync(join(__dirname, "seed.sql"), "utf-8");

    // Split the SQL file into individual statements
    const statements: string[] = sqlFile
      .split(";")
      .map((statement: string) => statement.trim())
      .filter((statement: string) => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(`${statement};`);
    }

    console.log("Seed data has been successfully applied");
  } catch (error) {
    console.error("Error applying seed data:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
