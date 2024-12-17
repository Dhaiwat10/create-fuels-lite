import { useEffect, useState } from "react";
import { useBalance, useDisconnect, useWallet } from "@fuels/react";

import LocalFaucet from "./LocalFaucet";
import { TestContract } from "../sway-api";
import Button from "./Button";
import { isLocal, contractId } from "../lib.tsx";
import { useNotification } from "../hooks/useNotification.tsx";
import { bn, BN, createAssetId, ZeroBytes32 } from "fuels";

export default function Contract() {
  const { disconnect } = useDisconnect();
  
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

  const { balance: walletETHBalance } = useBalance({
    address: wallet?.address.toB256(),
  });

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
        <div className="flex flex-col items-center justify-between dark:text-zinc-50">
          <Button
            onClick={mintTokens}
            className="w-1/3 mx-auto text-3xl"
            disabled={isLoading}
          >
            Mint ${tokenSymbol}
          </Button>

          <span className="mt-2 w-full text-center">
            Your wallet currently holds {tokenBalance?.format()} $DHAI
          </span>

          <Button
            onClick={() => disconnect()}
            className="w-1/3 mx-auto mt-4"
            color="secondary"
          >
            Disconnect Wallet
          </Button>
        </div>
      </div>

      {walletETHBalance?.lte(0) && (
        <div className="flex flex-col items-center justify-between dark:text-zinc-50">
          <span className="text-center">
            It looks like you don't have any ETH in your wallet. Please get some
            ETH from the{" "}
            <a
              href="https://faucet-testnet.fuel.network/"
              target="_blank"
              rel="noreferrer"
              className="text-green-500/80 transition-colors hover:text-green-500"
            >
              faucet
            </a>{" "}
            and refresh the page.
          </span>
        </div>
      )}

      {isLocal && <LocalFaucet refetch={refetch} />}
    </>
  );
}
