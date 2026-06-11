
const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
schema = schema.replace(/onDelete:\s*SetNull/g, `onDelete: NoAction, onUpdate: NoAction`);
fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Patched 3");

