import { NextRequest } from "next/server";

// Fetch a inscriptions using wallet address
export async function GET(request: NextRequest) {
  try {
    const axios = require("axios");

    console.log("fetchAllSyndicateRequest in backend ==> ", `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/fetchSyndicateRequestList`);

    let config = {
      method: "get",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/fetchSyndicateRequestList`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };

    const response = await axios.request(config);

    return Response.json(response.data);
  } catch (error) {
    console.error("Error fetchSyndicateRequestList: ", (error as any).response.data);
    return Response.json({ message: "Error fetchSyndicateRequestList" }, { status: 409 });
  }
}
