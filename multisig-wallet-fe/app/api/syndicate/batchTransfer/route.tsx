import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const { airdropId, unitAmount, runeId, ordinalPublicKey } = await request.json();
    const axios = require("axios");

    console.log(
      "batchTransfer in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/batchTransfer`
    );

    console.log("airdropId ==> ", airdropId);
    console.log("unitAmount ==> ", unitAmount);

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/batchTransfer`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        airdropId,
        unitAmount,
        runeId,
        ordinalPublicKey
      }),
    };

    const response = await axios.request(config);
    return Response.json(response.data);

  } catch (error) {
    console.error("Get error in batchTransfer ", (error as any).response.data);
    return Response.json(
      {
        success: false,
        message: "Error batchTransfer",
        payload: null,
      },
      { status: 409 }
    );
  }
}
