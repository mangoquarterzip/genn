"use client";
import type { NextPage } from "next";
import Head from "next/head";
import { Navbar } from "../components/navbar";
import {
  useContractRead,
  useContractEvent,
  useQuery,
  useQueryClient,
} from "wagmi";
import { oracleAbi } from "../abi/oracle";
import { config } from "../config";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [logs, setLogs] = useState<
    {
      number: string;
      sequence: number;
      blockNumber: number;
    }[]
  >([]);
  const [timer, setTime] = useState(0);
  const [averageInterval, setAverageInterval] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const max = 800;

  const { data: latestNumber } = useContractRead({
    abi: oracleAbi,
    address: config.oracleAddress,
    functionName: "getLatestNumber",
    watch: true,
  });

  const { data: sequence } = useContractRead({
    abi: oracleAbi,
    address: config.oracleAddress,
    functionName: "highestNonce",
    watch: true,
  });

  const unwatch = useContractEvent({
    address: config.oracleAddress,
    abi: oracleAbi,
    eventName: "RandomNumberSubmitted",
    listener: (logs) => {
      const events = logs.map((event) => ({
        number: event.args.number?.toString()!,
        sequence: Number(event.args.nonce)!,
        blockNumber: Number(event.blockNumber),
      }));

      setLogs((_log) => [...events, ..._log]);
    },
  });
  const { data } = useQuery(["drand-client"], {
    queryFn: async () => {
      const response = await fetch(config.drandEndpoint);
      return response.json();
    },
  });

  const calculateAverageBlock = async (response: any, blocks: number) => {
    const now = Date.now() / 1000;
    const diff = now - response.genesis_time;
    const int = diff / blocks;
    setAverageInterval(int);
  };

  useEffect(() => {
    data && calculateAverageBlock(data, Number(sequence));
  }, [data, sequence]);

  useEffect(() => {
    setTime(0);
  }, [latestNumber]);

  useEffect(() => {
    let interval = setInterval(() => {
      setTime((curr) => {
        if (curr > max) {
          return curr;
        }
        if (curr > max * 0.7) {
          return curr + 0.3;
        }

        return curr + 1;
      });
    }, 50);
    () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <Head>
        <title>Genn Dashboard</title>
        <meta content="Genn Dashboard" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <Navbar />

      <main className="grid place-content-center flex-1 w-screen ">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="prose">
              <h2 className="">Current</h2>
            </div>

            <div className="stats shadow">
              <div className="stat place-items-center">
                <div className="stat-title">Random Number</div>
                <div className="stat-value">
                  <p className="truncate text-ellipsis w-96">
                    {isClient && latestNumber?.toString()}
                  </p>
                </div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title">Sequence</div>
                <div className="stat-value ">
                  <p className="truncate">{isClient && sequence?.toString()}</p>
                </div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title">Interval</div>
                <div className="stat-value">{averageInterval.toFixed(10)}</div>
              </div>
            </div>

            <progress className="progress " value={timer} max={max}></progress>

            <div className="prose">
              <h2 className="">History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th>Sequence</th>
                    <th>Block Number</th>
                    <th>Randomness</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(1).map((log) => {
                    return (
                      <tr key={log.sequence}>
                        <td>{log.sequence}</td>
                        <td>{log.blockNumber}</td>
                        <td>{log.number}</td>
                      </tr>
                    );
                  })}
                  {/* row 1 */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
