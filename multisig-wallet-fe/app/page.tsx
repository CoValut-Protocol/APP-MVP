"use client";

import { useContext } from "react";
import WalletContext from "./contexts/WalletContext";

export default function Page() {
  const { ordinalAddress } = useContext(WalletContext);

  const isConnected = Boolean(ordinalAddress);

  return (
    <>
      <div className="flex w-full justify-center items-center">
        <img src="bg1.png" className="brightness-150"></img>
      </div>
      <div className="absolute z-10 w-full top-32 left-0 p-2 pb-20 bg-[#131416] min-h-screen">
        {isConnected ? (
          <></>
        ) : (
          <div className="mx-auto mt-28 w-[450px] h-[350px] bg-gradient-to-br from-[#6D757F] via-[#28292c] to-[#1C1D1F] p-[2px] rounded-xl">
            <div className="w-full h-full flex flex-col gap-2 items-center bg-[#1C1D1F] rounded-xl">
              <img
                src="wallet_connect_logo.png"
                className="mx-auto mt-10 "
              ></img>
              <div className="flex flex-row items-center text-white gap-2 text-[24px]">
                <p>WELCOME TO</p>
                <img src="logo2.png" className="brightness-150"></img>
                <p>COVAULT</p>
              </div>
              <p className="text-gray-600 text-[18px]">
                Connect to your Bitcoin wallet
              </p>
            </div>
          </div>
        )}
        {isConnected && (
          <div className="mt-10">{/* Dashboard - Wallet List */}</div>
        )}
      </div>
    </>
  );
}
