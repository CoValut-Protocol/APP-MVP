import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const { psbt, signedPsbt, walletType, inputsCount, ordinalAddress, walletId } = await request.json();
    const axios = require("axios");

    console.log(
      "broadcasting in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/airdrop/broadcasting`
    );

    console.log("psbt ==> ", psbt);
    console.log("signedPsbt ==> ", signedPsbt);
    console.log("walletType ==> ", walletType);
    console.log("inputsCount ==> ", inputsCount);

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/airdrop/broadcasting`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        psbt,
        signedPsbt,
        walletType,
        inputsCount,
        ordinalAddress,
        walletId
      }),
    };

    const response = await axios.request(config);
    return Response.json(response.data);
    // return Response.json("ok")
  } catch (error) {
    console.error(
      "Get error in Broadcasting ",
      (error as any).response.data
    );
    return Response.json(
      {
        success: false,
        message: "Error broadcasting psbt",
        payload: null,
      },
      { status: 409 }
    );
  }
}
