import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      marketplaceId,
      sellerOrdinalAddress,
      psbt,
      signedPSBT,
      walletType,
    } = await request.json();
    const axios = require("axios");

    console.log("syndicate-acceptRequest in next backend ==> ");

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/marketplace/syndicate-acceptRequest`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        marketplaceId,
        sellerOrdinalAddress,
        psbt,
        signedPSBT,
        walletType,
      }),
    };

    console.log("syndicate-acceptRequest ==> ", config);
    const response = await axios.request(config);
    console.log("Success in syndicate-acceptRequest ==> ", response.data);

    return Response.json(response.data);
  } catch (error) {
    return Response.json({ message: "Error syndicate-acceptRequest" }, { status: 409 });
  }
}
