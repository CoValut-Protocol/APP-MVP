import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      ordinalAddress,
      ordinalPublicKey,
      paymentAddress,
      paymentPublicKey,
    } = await request.json();
    const axios = require("axios");

    console.log(
      "staking fetchPrentList in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/fetchAllParent`
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/fetchAllParent`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        ordinalAddress,
        ordinalPublicKey,
        paymentAddress,
        paymentPublicKey,
      }),
    };

    const response = await axios.request(config);
    console.log("response ==> ", response.data);
    return Response.json(response.data.payload);
  } catch (error) {
    console.error("Error staking fetchPrentList", (error as any).response.data);
    return Response.json(
      { message: "Error staking fetchPrentList" },
      { status: 409 }
    );
  }
}
