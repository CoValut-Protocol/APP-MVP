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
      "syndiacte-ready-buyList in next backend ==> ",
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
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/marketplace/syndicate-ready-buyList`,
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

    console.log("syndicate-ready-buyList ==> ", config);
    const response = await axios.request(config);
    console.log("Success in syndicate-ready-buyList ==> ", response.data);

    return Response.json(response.data);
  } catch (error) {
    console.log("Error in syndicate-ready-buyList ==>", error);
    return Response.json({ message: "Error syndicate-ready-buyList" }, { status: 409 });
  }
}
