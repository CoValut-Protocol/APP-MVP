import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function GET(request: NextRequest) {
  try {
    const axios = require("axios");

    console.log(
      "fetch List in next backend ==> ",
    );

    let config = {
      method: "get",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/marketplace/fetchList`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };

    console.log("fetchList ==> ", config);
    const response = await axios.request(config);
    console.log("Success in list ==> ", response.data);

    return Response.json(response.data);
  } catch (error) {
    return Response.json({ message: "Error fetchList" }, { status: 409 });
  }
}
