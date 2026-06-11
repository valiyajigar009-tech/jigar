
const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
schema = schema.replace(/provider\s*=\s*"sqlite"/, `provider = "mongodb"`);
schema = schema.replace(/url\s*=\s*"file:\.\/dev\.db"/, `url      = env("DATABASE_URL")`);
schema = schema.replace(/(@id(?:\s+@default\([^)]+\))?)(?!\s*@map)/g, `$1 @map("_id")`);
fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Patched successfully!");

