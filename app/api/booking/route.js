export async function POST(req) {
  console.log("REQUEST RECEIVED:");
  const body = await req.text();
  console.log(body);
  return new Response("Your design consultation has been booked!");
}
