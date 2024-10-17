"use client";

import { type ReactNode } from "react";

import { NextUIProvider } from "@nextui-org/system";
import WalletProvider from "./contexts/WalletProvider";
import { ZkyToolkitProvider } from "@kondor-finance/zky-toolkit";

const API_KEY = "787ba7bc-0c90-4b4a-bd1e-5af7d5364dd5";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <NextUIProvider>
        <ZkyToolkitProvider apiKey={API_KEY}>{children}</ZkyToolkitProvider>
      </NextUIProvider>
    </WalletProvider>
  );
}
