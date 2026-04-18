
const fs = require("fs");

let tickets = fs.readFileSync("app/dashboard/tickets/page.tsx", "utf8");
tickets = tickets.replace("tickets.map((item: any) =>", "tickets.map((item: { id: number; userId: number; title: string; description: string; status: string; createdAt: string; }) =>");
fs.writeFileSync("app/dashboard/tickets/page.tsx", tickets, "utf8");

let payments = fs.readFileSync("app/dashboard/paiment/page.tsx", "utf8");
payments = payments.replace("payments.map((item: any) =>", "payments.map((item: { id: number; userId: number; amount: number; status: string; createdAt: string; }) =>");
fs.writeFileSync("app/dashboard/paiment/page.tsx", payments, "utf8");

console.log("Types fixed!");

