import { listenDrand } from "./drand.js";
import { initializeNode } from "./p2p.js";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { areon, recoverEcho, signEcho, submitOracle } from "./blockchain.js";
import { config } from "./config.js";

if (!process.env.PRIVATE_KEY) {
  throw new Error("Private key not found");
}
if (!process.env.BOOTSTRAP) {
  console.log("Bootstrap address not provided");
}

export const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
export const isLeader = process.env.IS_LEADER?.toLowerCase() == "true" || false;
export const bootstrapAddress = process.env.BOOTSTRAP || "";
export const account = privateKeyToAccount(privateKey);
console.log(isLeader ? "Running as leader" : "Not running as leader");

export const walletClient = createWalletClient({
  account,
  transport: http(config.rpc_url),
  chain: areon,
});

export type Echo = {
  randomness: string;
  round: number;
  chainHash: string;
  signature: `0x${string}`;
  account: `0x${string}`;
};

const main = async () => {
  // Initialize the node
  const node = await initializeNode();

  // Subscribe to topic
  const topic = "drand-oracle";
  node.services.pubsub.subscribe(topic);
  console.log(account.address);

  // Listen to drand events
  listenDrand(async (randomness) => {
    const signedRandomness = await signEcho(randomness);
    node.services.pubsub.publish(
      topic,
      new TextEncoder().encode(JSON.stringify(signedRandomness))
    );
  });
  // TODO: Update validator set

  // Round => Address => Message
  const messages = new Map<number, Map<`0x${string}`, Echo>>();

  // Receive events
  node.services.pubsub.addEventListener(
    "message",
    async (message): Promise<undefined> => {
      const payload: Echo = JSON.parse(
        new TextDecoder().decode(message.detail.data)
      );
      // TODO: Verify event and signature
      const address = await recoverEcho(payload);

      // Collect the events into a data structure
      if (messages.has(payload.round)) {
        let message = messages.get(payload.round);
        message?.set(address, payload);
      } else {
        messages.set(payload.round, new Map([[address, payload]]));
      }

      const echoMap = messages.get(payload.round);
      const size = echoMap?.size;
      console.log(`${message.detail.topic}:`, payload, address, size);

      // Emit events if leader and have enough events
      // TODO: Check for supermajority
      if (isLeader && size === 1) {
        console.log("Attempting to submit oracle");
        await submitOracle([...echoMap?.values()!]);
        messages.delete(payload.round);
      }
    }
  );
};

main();
