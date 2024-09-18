import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      claimableMinTime,
      rewardRate,
      rewardRuneId,
      stakableRuneId,
      imageUrl,
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
    } = await request.json();
    const axios = require("axios");

    console.log(
      "create Parent staking Vault in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/create-staking-vault`
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/create-staking-vault`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        imageUrl,
        stakableRuneId,
        rewardRuneId,
        rewardRate,
        liveTime: 100,
        claimableMinTime,
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
    console.error(
      "Get error in create Parent staking Vault ",
      (error as any).response.data
    );
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
