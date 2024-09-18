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
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/marketplace/syndicate-fetchList`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };

    console.log("syndicate-fetchList ==> ", config);
    const response = await axios.request(config);
    console.log("Success in list ==> ", response.data);

    return Response.json(response.data);
  } catch (error) {
    return Response.json({ message: "Error syndicate-fetchList" }, { status: 409 });
  }
}
