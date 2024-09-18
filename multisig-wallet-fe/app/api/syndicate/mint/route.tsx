import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      walletId,
    } = await request.json();
    const axios = require("axios");

    console.log(
      "mintAirdrop in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/mint`
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/mint`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        paymentAddress,
        paymentPublicKey,
        ordinalAddress,
        ordinalPublicKey,
        walletId,
      }),
    };

    const response = await axios.request(config);
    console.log("response.data ==> ", response.data)
    return Response.json(response.data);
  } catch (error) {
    console.error("Error syndicate/mint: ", (error as any).response.data);
    return Response.json({ message: "Error syndicate/mint" }, { status: 409 });
  }
}
