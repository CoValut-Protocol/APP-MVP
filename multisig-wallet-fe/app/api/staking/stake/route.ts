import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const { signedPsbt, stakingListId } = await request.json();
    const axios = require("axios");

    console.log(
      "stake in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/stake`
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/stake`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        signedPsbt,
        stakingListId,
      }),
    };

    const response = await axios.request(config);
    console.log("response ==> ", response);
    return Response.json(response.data);
  } catch (error) {
    console.error("Get error in stake ", (error as any).response.data);
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
