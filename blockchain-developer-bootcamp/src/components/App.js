import { useEffect } from "react";
import { useDispatch } from "react-redux";
// import { ethers } from "ethers";
import config from "../config.json";
// import TOKEN_ABI from "../abis/Token.json";

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
} from "../store/interactions";

import Navbar from "./Navbar";
import Markets from "./Markets";
import Balance from "./Balance";
import Order from "./Order";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // We are loading the blockchain data...

    // Connect ethers to the blockchain....
    const provider = loadProvider(dispatch);
    // Fetch current network's chainID (e.g hardhat:31337 , kovan:42)
    const chainId = await loadNetwork(provider, dispatch);

    // Reload page when network changes
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    // Fetch current account and balance from metamask when changed.....
    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch);
    });
    // await loadAccount(provider, dispatch); // This will fetch a account from the metamask and log it on the console.....

    // Talk to the token smart contract......(or) Load token smart contracts
    const DApp = config[chainId].DApp;
    const mETH = config[chainId].mETH;
    await loadTokens(provider, [DApp.address, mETH.address], dispatch);

    // Load exchange smart contract
    const exchangeConfig = config[chainId].exchange;
    const exchange = await loadExchange(
      provider,
      exchangeConfig.address,
      dispatch
    );
    // console.log(exchange.address);

    // Listen to events
    subscribeToEvents(exchange, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          <Markets />

          <Balance />

          <Order />
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  );
}

export default App;
