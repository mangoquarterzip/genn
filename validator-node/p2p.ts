import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { yamux } from "@chainsafe/libp2p-yamux";
import { noise } from "@chainsafe/libp2p-noise";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { identify } from "@libp2p/identify";
import { keys } from "@libp2p/crypto";
import { createFromPrivKey } from "@libp2p/peer-id-factory";
import { bootstrapAddress, privateKey } from "./main.js";
import { hexToBytes } from "viem";
import { bootstrap } from "@libp2p/bootstrap";
import { peerIdFromString } from "@libp2p/peer-id";
import { mdns } from "@libp2p/mdns";

export const port = process.env.PORT || 3333;

export const initializeNode = async () => {
  const key = new keys.Secp256k1PrivateKey(hexToBytes(privateKey));
  const node = await createLibp2p({
    // libp2p nodes are started by default, pass false to override this
    addresses: {
      listen: [`/ip4/0.0.0.0/tcp/${port}`],
    },
    peerId: await createFromPrivKey(key),
    transports: [tcp()],
    streamMuxers: [yamux(), mplex()],
    connectionEncryption: [noise()],
    peerDiscovery: [
      mdns({
        interval: 20e3,
      }),
      bootstrap({
        list: [
          // a list of bootstrap peer multiaddrs to connect to on node startup
          // "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
          bootstrapAddress,
          // "/ip4/10.114.0.2/tcp/42637/p2p/16Uiu2HAmKh2tM31HiyikieCMNBcdSovpddiFGpdvCHiJKntrnyQJ",
        ],
        timeout: 1000, // in ms,
        tagName: "bootstrap",
        tagValue: 50,
        tagTTL: 120000, // in ms
      }),
    ],
    services: {
      pubsub: gossipsub({
        emitSelf: true,
      }),
      identify: identify({}),
    },
    connectionManager: {},
  });

  // start libp2p
  console.log("libp2p has started");

  const listenAddrs = node.getMultiaddrs();
  console.log("libp2p is listening on the following addresses: ", listenAddrs);

  node.addEventListener("peer:discovery", (evt) =>
    console.log("Discovered:", evt.detail.id.toString())
  );

  node.addEventListener("peer:connect", (evt) => {
    const peerId = evt.detail;
    console.log("Connection established to:", peerId.toString()); // Emitted when a peer has been found
  });

  const bootstrap_peer_id = peerIdFromString(
    "16Uiu2HAmKh2tM31HiyikieCMNBcdSovpddiFGpdvCHiJKntrnyQJ"
  );

  if (!bootstrap_peer_id.equals(node.peerId)) {
    console.log("Not leader, so finding peer");
  } else {
    console.log("Bootstrapper");
  }

  return node;
};
