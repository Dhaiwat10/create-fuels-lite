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
    errorNotification,
    transactionSubmitNotification,
    transactionSuccessNotification,
  } = useNotification();
  const [contract, setContract] = useState<TestContract>();
  const [isLoading, setIsLoading] = useState(false);

  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [tokenDecimals, setDecimals] = useState<number>();
  const [tokenBalance, setTokenBalance] = useState<BN>();

  const { wallet, refetch } = useWallet();

  useEffect(() => {
    (async () => {
      if (wallet && !contract) {
        const testContract = new TestContract(contractId, wallet);

        const { value: tokenSymbol } = await testContract.functions
          .symbol(createAssetId(contractId, ZeroBytes32))
          .get();
        setTokenSymbol(tokenSymbol);

        const { value: tokenDecimals } = await testContract.functions
          .decimals(createAssetId(contractId, ZeroBytes32))
          .get();
        setDecimals(tokenDecimals);

        const balance = await wallet.getBalance(
          createAssetId(contractId, ZeroBytes32).bits
        );
        setTokenBalance(balance);

        setContract(testContract);
      }
    })();
  }, [wallet, contract]);

  const mintTokens = async () => {
    try {
      setIsLoading(true);

      if (!wallet || !contract) {
        return;
      }

      const mintTx = await contract?.functions
        .mint(
          {
            Address: {
              bits: wallet.address.toB256(),
            },
          },
          ZeroBytes32,
          bn.parseUnits("5", tokenDecimals)
        )
        .call();

      transactionSubmitNotification("Minting 5 $DHAI");

      await mintTx.waitForResult();

      // refetch balance
      const balance = await wallet.getBalance(
        createAssetId(contractId, ZeroBytes32).bits
      );
      setTokenBalance(balance);

      transactionSuccessNotification("Minted 5 $DHAI");

      setIsLoading(false);
    } catch (error) {
      errorNotification(`${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="flex flex-col items-center justify-between text-base dark:text-zinc-50">
          <Button
            onClick={mintTokens}
            className="w-1/3 mx-auto"
            disabled={isLoading}
          >
            Mint ${tokenSymbol}
          </Button>

          <span className="mt-2 w-full text-center">
            Your wallet currently holds {tokenBalance?.format()} $DHAI
          </span>
        </div>
      </div>

      {isLocal && <LocalFaucet refetch={refetch} />}
    </>
  );
}
