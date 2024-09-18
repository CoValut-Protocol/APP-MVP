import { NextRequest } from "next/server";

// Fetch a inscriptions using wallet address
export async function GET(request: NextRequest) {
  try {
    const axios = require("axios");

    console.log("fetchSyndicateList in backend ==> ", `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/fetchSyndicateList`);

    let config = {
      method: "get",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/fetchSyndicateList`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };

    const response = await axios.request(config);

    return Response.json(response.data);
  } catch (error) {
    console.error("Error fetchSyndicateList: ", (error as any).response.data);
    return Response.json({ message: "Error fetchSyndicateList" }, { status: 409 });
  }
}
