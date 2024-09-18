import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      listId,
      buyerOrdinalAddress,
      buyerOrdinalPubkey,
      buyerPaymentAddress,
      buyerPaymentPubkey,
    } = await request.json();
    const axios = require("axios");

    console.log(
      "pre_buyList in next backend ==> ",
      listId,
      buyerOrdinalAddress,
      buyerOrdinalPubkey,
      buyerPaymentAddress,
      buyerPaymentPubkey
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/marketplace/syndicate-pre-buyList`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        listId,
        buyerOrdinalAddress,
        buyerOrdinalPubkey,
        buyerPaymentAddress,
        buyerPaymentPubkey,
      }),
    };

    console.log("syndicate-pre-buyList ==> ", config);
    const response = await axios.request(config);
    console.log("Success in syndicate-pre-buyList ==> ", response.data);

    return Response.json(response.data);
  } catch (error) {
    return Response.json(
      { message: "Error syndicate-pre-buyList" },
      { status: 409 }
    );
  }
}
