
const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
schema = schema.replace(/@default\(cuid\(\)\s*@map\("_id"\)\)/g, `@default(cuid()) @map("_id")`);
schema = schema.replace(/@default\(1\s*@map\("_id"\)\)/g, `@default(1) @map("_id")`);
fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Patched successfully!");

