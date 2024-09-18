import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {

    const {
        marketplaceId, 
        buyerOrdinalsAddress
      } = await request.json();
    const axios = require("axios");

    console.log(
      "cancleRequest in next backend ==> ",
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/marketplace/cancelRequest`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        marketplaceId, 
        buyerOrdinalsAddress
      }),
    };

    console.log("cancleRequest ==> ", config);
    const response = await axios.request(config);
    console.log("Success in cancleRequest ==> ", response.data);

    return Response.json(response.data);
  } catch (error) {
    return Response.json({ message: "Error cancelRequest" }, { status: 409 });
  }
}
