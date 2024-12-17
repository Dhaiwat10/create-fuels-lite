import { providerUrl } from "../lib.tsx";

export default function Info() {
  return (
    <div id="text" className="col-span-2 px-4 py-4">
      <h1 className="pb-1 pt-0 text-3xl font-medium">
        Fuel SRC20 Minter
      </h1>
      <p>
        This dapp was bootstrapped with the{" "}
        <a
          href="https://docs.fuel.network/docs/fuels-ts/creating-a-fuel-dapp/"
          target="_blank"
          className="text-green-500/80 transition-colors hover:text-green-500"
          rel="noreferrer"
        >
          create fuels CLI
        </a>
      </p>
      <p className="pt-6">
        You are currently connected to:{" "}
        <a
          href={providerUrl}
          target="_blank"
          rel="noreferrer"
          className="text-green-500/80 transition-colors hover:text-green-500 font-mono"
        >
          {providerUrl}
        </a>
      </p>
      <a
        href="https://docs.fuel.network/docs"
        target="_blank"
        className="inline-block mt-6 text-green-500/80 transition-colors hover:text-green-500 w-full"
        rel="noreferrer"
      >
        Fuel Docs
      </a>
      <a
        href="https://github.com/dhaiwat10/fuel-src20-minter"
        target="_blank"
        className="inline-block mt-2 text-green-500/80 transition-colors hover:text-green-500 w-full"
        rel="noreferrer"
      >
        Repo Link
      </a>
    </div>
  );
}
