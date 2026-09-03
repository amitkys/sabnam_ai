import { execSync, spawnSync } from "child_process";

// Bun automatically loads .env into process.env
const databaseUrl = process.env.REMOTE_DATABASE_URL || process.env.DATABASE_URL;
const containerName = process.env.DOCKER_CONTAINER || "db";
const dbUser = process.env.DOCKER_DB_USER || "amitkys";
const dbName = process.env.DOCKER_DB_NAME || "sabnam";

if (!databaseUrl) {
  console.error("❌ Error: DATABASE_URL is not defined in environment or .env file.");
  process.exit(1);
}

console.log("🚀 Database Pull Tool: Remote -> Local Docker Postgres");
console.log(`   Container: ${containerName}`);
console.log(`   DB User:   ${dbUser}`);
console.log(`   DB Name:   ${dbName}`);

try {
  // 1. Drop existing database if it exists
  console.log(`\n1️⃣  Dropping database '${dbName}' if it exists...`);
  spawnSync("docker", ["exec", "-i", containerName, "dropdb", "-U", dbUser, "--if-exists", dbName], {
    stdio: "inherit",
  });

  // 2. Create database
  console.log(`\n2️⃣  Creating database '${dbName}'...`);
  const createRes = spawnSync("docker", ["exec", "-i", containerName, "createdb", "-U", dbUser, dbName], {
    stdio: "inherit",
  });

  if (createRes.status !== 0) {
    console.error(`❌ Failed to create database '${dbName}'. Please check if container '${containerName}' is running.`);
    process.exit(1);
  }

  // 3. Dump remote database and import into Docker DB
  console.log(`\n3️⃣  Dumping remote database and restoring into Docker '${dbName}'...`);
  const dumpRestoreCmd = `docker exec -i ${containerName} pg_dump --no-owner --no-acl "${databaseUrl}" | docker exec -i ${containerName} psql -U ${dbUser} -d ${dbName}`;
  execSync(dumpRestoreCmd, { stdio: "inherit" });

  console.log(`\n✅ Database successfully imported into Docker container DB '${dbName}'!`);
} catch (error: any) {
  console.error("\n❌ An error occurred during database import:", error?.message || error);
  process.exit(1);
}
