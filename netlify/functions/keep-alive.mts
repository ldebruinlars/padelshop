// Dagelijkse aanroep van de database: Supabase pauzeert een gratis project na een week zonder verkeer, en dan werkt boeken niet.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://pprmrrhiprchhxwkaocx.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_KefKZ6wZjzeG3WJClyhuDQ_BOkiUu8w";

export default async () => {
  const day = new Date().toISOString().slice(0, 10);
  const res = await fetch(`${URL}/rest/v1/rpc/taken_slots`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_from: day, p_to: day }),
  });
  console.log("keep-alive", res.status);
  return new Response(null, { status: res.ok ? 200 : 502 });
};

export const config = { schedule: "@daily" };
