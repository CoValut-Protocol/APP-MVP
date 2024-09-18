import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const {
      parentId
    } = await request.json();
    const axios = require("axios");

    console.log(
      "staking approveClaimRequest in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/approve-claim-request`
    );

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/staking/approve-claim-request`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        parentId
      }),
    };

    const response = await axios.request(config);
    console.log("response ==> ", response.data);
    return Response.json(response.data);
  } catch (error) {
    console.error("Error staking approveClaimRequest", (error as any).response.data);
    return Response.json(
      { message: "Error staking approveClaimRequest" },
      { status: 409 }
    );
  }
}
