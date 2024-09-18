import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      parentId,
      stakingAmount,
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
    } = await request.json();
    const axios = require("axios");

    console.log(
      "pre-stake in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/pre-stake`
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/pre-stake`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        parentId,
        amount: stakingAmount,
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
    console.error("Get error in pre-stake ", (error as any).response.data);
    return Response.json(
      {
        success: false,
        message: "Error create Parent staking Vault",
        payload: null,
      },
      { status: 409 }
    );
  }
}
