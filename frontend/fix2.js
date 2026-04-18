const fs = require("fs");
let s1 = fs.readFileSync("app/dashboard/step1/page.tsx", "utf8");
s1 = s1.replace(`import { useState } from "next";`, `import { useState } from "react";`);
fs.writeFileSync("app/dashboard/step1/page.tsx", s1, "utf8");

let s2 = fs.readFileSync("app/dashboard/step2/page.tsx", "utf8");
s2 = s2.replace(`import { useState } from "next";`, `import { useState } from "react";`);
fs.writeFileSync("app/dashboard/step2/page.tsx", s2, "utf8");

console.log("Fixed state imports.");

