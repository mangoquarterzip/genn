import { RandomnessBeacon } from "drand-client";
import {
  defineChain,
  encodeAbiParameters,
  getContract,
  hashMessage,
  hexToBigInt,
  keccak256,
  parseAbiParameters,
  recoverMessageAddress,
  verifyMessage,
} from "viem";
import { chainHash } from "./drand.js";
import { Echo, walletClient } from "./main.js";
import { OracleAbi } from "./abi/oracle.js";
import { config } from "./config.js";

export const areon = defineChain({
  id: 462,
  name: "Areon Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Test Area",
    symbol: "TAREA",
  },
  rpcUrls: {
    default: {
      http: [config.rpc_url],
    },
  },
});
export const getValidatorSet = async () => {
  const oracleContract = getContract({
    abi: OracleAbi,
    address: config.oracleAddress,
    client: walletClient,
  });
};

const chainHashBigInt = hexToBigInt(`0x${chainHash}`);

export const recoverEcho = async (message: Echo) => {
  const hashedMessage = encodeAbiParameters(
    parseAbiParameters("uint, uint,uint"),
    [chainHashBigInt, BigInt(message.randomness), BigInt(message.round)]
  );

  return recoverMessageAddress({
    message: { raw: hashedMessage },
    signature: message.signature,
  });
};

export const signEcho = async (randomness: RandomnessBeacon) => {
  const randomNumber = hexToBigInt(`0x${randomness.randomness}`);
  console.log("Random number to be signed", randomNumber);
  const hashedMessage = encodeAbiParameters(
    parseAbiParameters("uint,uint,uint"),
    [chainHashBigInt, randomNumber, BigInt(randomness.round)]
  );
  const signature = await walletClient.signMessage({
    message: { raw: hashedMessage },
  });

  // Sign message
  const message: Echo = {
    randomness: randomNumber.toString(),
    round: randomness.round,
    chainHash,
    signature,
    account: walletClient.account.address,
  };

  return message;
};

export const submitOracle = async (echoes: Echo[]) => {
  const signatures = echoes.map((echo) => echo.signature);
  const randomnesses = BigInt(echoes[0].randomness);
  const rounds = BigInt(echoes[0].round);

  let oracleContract = getContract({
    abi: OracleAbi,
    address: config.oracleAddress,
    client: walletClient,
  });

  let hash = await oracleContract.write.submit([
    chainHashBigInt,
    randomnesses,
    rounds,
    signatures,
  ]);
  console.log("Oracle Submitted, tx hash: ", hash);
};
