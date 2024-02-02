import { watch, FastestNodeClient, RandomnessBeacon } from "drand-client";

export const chainHash =
  "8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce"; // (hex encoded)
const publicKey =
  "868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31"; // (hex encoded)

export const listenDrand = async (
  handleRandomness: (randomness: RandomnessBeacon) => void
) => {
  const options = {
    disableBeaconVerification: false, // `true` disables checking of signatures on beacons - faster but insecure!!!
    noCache: false, // `true` disables caching when retrieving beacons for some providers
    chainVerificationParams: { chainHash, publicKey }, // these are optional, but recommended! They are compared for parity against the `/info` output of a given node
  };

  // if you're happy to get randomness from many APIs and automatically use the fastest
  // you can construct a `FastestNodeClient` with multiple URLs
  // note: the randomness beacons are cryptographically verifiable, so as long as you fill
  // in the `chainVerificationParams` in the options, you don't need to worry about malicious
  // providers sending you fake randomness!
  const urls = [
    "https://api.drand.sh",
    "https://drand.cloudflare.com",
    "https://api2.drand.sh",
    "https://api3.drand.sh",
    "https://drand.cloudflare.com",
    "https://api.drand.secureweb3.com:6875",
  ];

  const fastestNodeClient = new FastestNodeClient(urls, options);
  // don't forget to start the client, or it won't periodically optimise for the fastest node!
  fastestNodeClient.start();
  console.log("Start listening Drand");

  // you can also use the `watch` async generator to watch the latest randomness automatically!
  // use an abort controller to stop it
  const abortController = new AbortController();
  for await (const beacon of watch(fastestNodeClient, abortController)) {
    handleRandomness(beacon);
  }

  // don't forget to stop the speed testing, or you may leak a `setInterval` call!
  fastestNodeClient.stop();
};
