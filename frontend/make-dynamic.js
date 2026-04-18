
const fs = require("fs");

function updateTickets() {
  let code = fs.readFileSync("app/dashboard/tickets/page.tsx", "utf8");
  
  const imports = `import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";`;
  
  if (!code.includes("useSession")) {
    code = code.replace(`"use client";`, `"use client";\n${imports}`);
  }

  const hooks = `
  const { data: session } = useSession();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetch("http://localhost:3001/tickets", {
        headers: {
          Authorization: \`Bearer \${session.accessToken}\`
        }
      })
      .then(res => res.json())
      .then(data => { setTickets(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
    }
  }, [session]);
`;

  code = code.replace(`export default function TicketsPage() {`, `export default function TicketsPage() {${hooks}`);

  // Replace map array
  code = code.replace(`{[1,2,3,4,5].map((item) => (`, `{loading ? <tr><td colSpan={5} className="p-4 text-center">Chargement...</td></tr> : tickets.map((item: any) => (`);

  fs.writeFileSync("app/dashboard/tickets/page.tsx", code, "utf8");
  console.log("Updated tickets page");
}

function updatePayments() {
  let code = fs.readFileSync("app/dashboard/paiment/page.tsx", "utf8");
  
  const imports = `import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";`;
  
  if (!code.includes("useSession")) {
    code = code.replace(`"use client";`, `"use client";\n${imports}`);
  }

  const hooks = `
  const { data: session } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetch("http://localhost:3001/payments", {
        headers: {
          Authorization: \`Bearer \${session.accessToken}\`
        }
      })
      .then(res => res.json())
      .then(data => { setPayments(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
    }
  }, [session]);
`;

  code = code.replace(`export default function PaymentPage() {`, `export default function PaymentPage() {${hooks}`);

  // Need to replace the table rows mapping
  code = code.replace(`<tbody>`, `<tbody>\n              {loading ? <tr><td colSpan={5} className="p-4 text-center">Chargement...</td></tr> : payments.map((item: any) => (\n                <tr key={item.id} className="border-b border-black/5 hover:bg-gray-50/50 transition-colors">\n                  <td className="p-4 font-medium text-[#1c1b1b]">#{item.id}</td>\n                  <td className="p-4 font-bold text-[#1c1b1b]">{item.amount} €</td>\n                  <td className="p-4"><span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">{item.status}</span></td>\n                  <td className="p-4 text-[#a1a1aa] font-medium">{new Date(item.createdAt).toLocaleDateString()}</td>\n                  <td className="p-4 text-right"><button className="text-[#a1a1aa] hover:text-[#1c1b1b] transition-colors">Détails</button></td>\n                </tr>\n              ))}`);

  // remove the old rows (from <tr> to </tr>)
  code = code.replace(/<tr className="border-b border-black\/5 hover:bg-gray-50\/50 transition-colors">[\s\S]*?<\/tr>/g, "");
  
  fs.writeFileSync("app/dashboard/paiment/page.tsx", code, "utf8");
  console.log("Updated payments page");
}

try {
  updateTickets();
  updatePayments();
} catch (e) {
  console.error(e);
}

