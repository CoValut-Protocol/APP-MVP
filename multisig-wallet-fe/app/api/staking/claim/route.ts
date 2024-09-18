import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      parentId,
      rewardAddress,
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
    } = await request.json();
    const axios = require("axios");

    console.log(
      "claim in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/claim`
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/claim`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        parentId,
        rewardAddress,
        paymentAddress,
        paymentPublicKey,
        ordinalAddress,
        ordinalPublicKey,
      }),
    };

    const response = await axios.request(config);
    console.log("response ==> ", response);
    return Response.json(response.data);
  } catch (error) {
    console.error("Get error in claim ", (error as any).response.data);
    return Response.json(
      {
        success: false,
        message: "Error create Parent claim",
        payload: null,
      },
      { status: 409 }
    );
  }
}
