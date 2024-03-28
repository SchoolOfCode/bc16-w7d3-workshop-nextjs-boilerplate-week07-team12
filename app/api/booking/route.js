import { readFile, writeFile } from "node:fs/promises";
import { inspect } from "node:util";

const filePath = "./app/api/booking/data.json";

export async function POST(req) {
  console.log("REQUEST RECEIVED:");
  const body = await req.json();
  console.log(inspect(body));
  const file = await readFile(filePath, "utf-8");
  const data = JSON.parse(file);
  data.push(body);
  await writeFile(filePath, JSON.stringify(data), "utf-8");
  return new Response("Your design consultation has been booked!");
}
