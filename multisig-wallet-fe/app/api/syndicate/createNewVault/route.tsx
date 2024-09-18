import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const { cosignerList, thresHoldValue, assets, creator, imageUrl } = await request.json();
    const axios = require("axios");

    console.log("createNativeSegwit in backend ==> ", `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/create-vault`);
    console.log("cosignerList ==> ", cosignerList);
    console.log("thresHoldValue ==> ", thresHoldValue);

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/create-vault`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        pubKeyList: cosignerList,
        minSignCount: thresHoldValue,
        assets,
        creator,
        imageUrl
      }),
    };

    const response = await axios.request(config);
    return Response.json(response.data);
    // return Response.json("ok")
  } catch (error) {
    console.error("Error creating new Syndicate Native segwit Musig: ", (error as any).response.data);
    return Response.json({ 
      success: false, 
      message: "Error creating new Syndicate Native segwit Musig",
      payload: null
    }, { status: 409 });
  }
}
