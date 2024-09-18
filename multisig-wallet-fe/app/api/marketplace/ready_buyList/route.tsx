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
      psbt,
      inputsArray,
    } = await request.json();
    const axios = require("axios");

    console.log(
      "ready-buyList in next backend ==> ",
      listId,
      buyerOrdinalAddress,
      buyerOrdinalPubkey,
      buyerPaymentAddress,
      buyerPaymentPubkey,
      psbt,
      inputsArray
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/marketplace/ready-buyList`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        listId,
        buyerOrdinalAddress,
        buyerOrdinalPubkey,
        buyerPaymentAddress,
        buyerPaymentPubkey,
        psbt,
        inputsArray,
      }),
    };

    console.log("ready-buyList ==> ", config);
    const response = await axios.request(config);
    console.log("Success in ready-buyList ==> ", response.data);

    return Response.json(response.data);
  } catch (error) {
    console.log("Error in ready-buyList ==>", error);
    return Response.json({ message: "Error ready-buyList" }, { status: 409 });
  }
}
