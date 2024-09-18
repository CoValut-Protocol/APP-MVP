import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      sellerOrdinalAddress,
      sellerOrdinalPubkey,
      sellerPaymentAddress,
      sellerPaymentPubkey,
      runeTicker,
      sellPrice,
      imageUrl
    } = await request.json();
    const axios = require("axios");

    console.log(
      "List in next backend ==> ",
      sellerOrdinalAddress,
      sellerOrdinalPubkey,
      sellerPaymentAddress,
      sellerPaymentPubkey,
      runeTicker,
      sellPrice,
      imageUrl
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/marketplace/list`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        sellerOrdinalAddress,
        sellerOrdinalPubkey,
        sellerPaymentAddress,
        sellerPaymentPubkey,
        runeTicker,
        sellPrice,
        imageUrl
      }),
    };

    console.log("list ==> ", config);
    const response = await axios.request(config);
    console.log("Success in list ==> ", response.data);

    return Response.json(response.data);
  } catch (error) {
    return Response.json({ message: "Error pre_buyList" }, { status: 409 });
  }
}
