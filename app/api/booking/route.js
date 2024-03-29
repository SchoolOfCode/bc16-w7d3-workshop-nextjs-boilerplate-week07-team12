import { readFile, writeFile } from "node:fs/promises";
import path from "path";

// Define the file relatively for accuracy
const filepath = path.join(process.cwd(), "app/api/booking/bookingData.json");

// extracted function to handle post requests
export async function POST (req) {
  try {
    const body = await req.json();
    const file = await readFile(filepath, "utf8");
    const data = JSON.parse(file);
    
    data.push(body);
    await writeFile(filepath, JSON.stringify(data, null, 2), "utf8");
    
    return Response.json({ success: true, payload: { msg: "Consultation Booked!" }});
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: "Internal Server Error" });
  }
}

// import read/write file from fs    ***
// assign filepath to variable      ***
// define function (req, res) to handle our post request    ***
// try catch for graceful error handling    ***
// get data from req.json and assign to variable    ***
// parse current data from json file    ***
// add our data to the existing data with push method    ***
// write new data to json docustore    ***
// success response status and message to be handled on frontend    ***
// fail response status and message to be handled on frontend    ***