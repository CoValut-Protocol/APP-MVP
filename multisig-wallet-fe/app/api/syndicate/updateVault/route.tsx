import { NextRequest } from "next/server";
import qs from "qs";

// Fetch a inscriptions using wallet address
export async function POST(request: NextRequest) {
  try {
    const { selectedVault, cosignerList, thresHoldValue, ordinalAddress, imageUrl } =
      await request.json();
    const axios = require("axios");

    console.log(
      "update multisig wallet in backend ==> ",
      `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/update-vault`
    );

    console.log("data ==> ", {
      vaultId: selectedVault._id,
      pubKeyList: cosignerList,
      minSignCount: thresHoldValue,
      assets: selectedVault.assets,
      ordinalAddress,
      imageUrl
    });

    let config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BACKEND}/api/syndicate/update-vault`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify({
        vaultId: selectedVault._id,
        pubKeyList: cosignerList,
        minSignCount: thresHoldValue,
        assets: selectedVault.assets,
        ordinalAddress,
        imageUrl
      }),
    };

    const response = await axios.request(config);

    return Response.json(response.data);
  } catch (error) {
    console.error(
      "Error creating Update Vault: ",
      (error as any).response.data
    );
    return Response.json(
      { message: "Error creating Update Vault" },
      { status: 409 }
    );
  }
}
