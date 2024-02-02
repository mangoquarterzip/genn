import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, mainnet, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { http, Chain } from "viem";

const areonTestnet: Chain = {
  id: 462,
  name: "Areon",
  network: "areon",
  nativeCurrency: {
    decimals: 18,
    name: "Areon",
    symbol: "TAREA",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.areon.network"],
    },
    public: {
      http: ["https://testnet-rpc.areon.network"],
    },
  },
};

export const { chains, publicClient } = configureChains(
  [areonTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
