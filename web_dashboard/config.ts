export const config: ChainConfig = {
  oracleAddress: "0x70c83e645012c78278814babe8e4f57f32b192e4",
  drandEndpoint:
    "https://api.drand.sh/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/info",
};

type ChainConfig = {
  oracleAddress: `0x${string}`;
  drandEndpoint: string;
};
