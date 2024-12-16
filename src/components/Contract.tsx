import { useEffect, useState } from "react";
import { useWallet } from "@fuels/react";

import LocalFaucet from "./LocalFaucet";
import { TestContract } from "../sway-api";
import Button from "./Button";
import { isLocal, contractId } from "../lib.tsx";
import { useNotification } from "../hooks/useNotification.tsx";
import { bn, BN, createAssetId, ZeroBytes32 } from "fuels";

export default function Contract() {
  const {
    // errorNotification,
    // transactionSubmitNotification,
    transactionSuccessNotification,
  } = useNotification();
  const [contract, setContract] = useState<TestContract>();
  const [isLoading, setIsLoading] = useState(false);

  const [tokenName, setTokenName] = useState<string>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();

  const [tokenBalance, setTokenBalance] = useState<BN>();

  const { wallet, refetch } = useWallet();

  useEffect(() => {
    (async () => {
      if (wallet && !contract) {
        const testContract = new TestContract(contractId, wallet);

        const { value: tokenName } = await testContract.functions
          .name(createAssetId(contractId, ZeroBytes32))
          .get();
        setTokenName(tokenName);

        const { value: tokenSymbol } = await testContract.functions
          .symbol(createAssetId(contractId, ZeroBytes32))
          .get();
        setTokenSymbol(tokenSymbol);

        const balance = await wallet.getBalance(
          createAssetId(contractId, ZeroBytes32).bits
        );
        setTokenBalance(balance);

        setContract(testContract);
      }
    })();
  }, [wallet, contract]);

  const mintTokens = async () => {
    setIsLoading(true);

    if (!wallet || !contract) {
      return;
    }

    // mint 1000 tokens
    const mintTx = await contract?.functions
      .mint(
        {
          Address: {
            bits: wallet.address.toB256(),
          },
        },
        ZeroBytes32,
        bn(1000)
      )
      .call();

    await mintTx.waitForResult();

    // refetch balance
    const balance = await wallet.getBalance(
      createAssetId(contractId, ZeroBytes32).bits
    );
    setTokenBalance(balance);

    transactionSuccessNotification("Minted 1000 tokens");

    setIsLoading(false);
  };

  return (
    <>
      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Token {tokenName} ${tokenSymbol}
        </h3>
        <div className="flex items-center justify-between text-base dark:text-zinc-50">
          <Button onClick={mintTokens} className="w-1/3" disabled={isLoading}>
            Mint
          </Button>
        </div>

        <div className="mt-2">
          <span>Token Balance: {tokenBalance?.toString()}</span>
        </div>
      </div>
      <div>
        <p className="pt-2">
          Contracts are a core program type on the Fuel network. You can read
          more about them{" "}
          <a
            href="https://docs.fuel.network/docs/fuels-ts/contracts/"
            className="text-green-500/80 transition-colors hover:text-green-500"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
        <p className="pt-2">
          This is a simple counter contract which you can edit at{" "}
          <code>sway-programs/contract/src/main.sw</code>.
        </p>
        <p className="pt-2">
          Extend this example by adding decrement functionality by working
          through{" "}
          <a
            href="https://docs.fuel.network/docs/fuels-ts/creating-a-fuel-dapp/#adding-decrement-functionality"
            className="text-green-500/80 transition-colors hover:text-green-500"
            target="_blank"
            rel="noreferrer"
          >
            this guide
          </a>
          .
        </p>
      </div>
      {isLocal && <LocalFaucet refetch={refetch} />}
    </>
  );
}
