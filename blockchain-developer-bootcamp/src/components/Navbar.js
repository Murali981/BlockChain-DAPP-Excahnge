import { useSelector, useDispatch } from "react-redux";
import Blockies from "react-blockies";
import { loadAccount } from "../store/interactions";
import logo from "../assets/logo.png";
import eth from "../assets/eth.svg";
import config from "../config.json";

const Navbar = () => {
  const provider = useSelector((state) => state.providers.connection);
  const chainId = useSelector((state) => state.providers.chainId);
  const account = useSelector((state) => state.providers.account);
  const balance = useSelector((state) => state.providers.balance);

  // Check if account is defined before using slice
  const accountDisplay = account?.slice(0, 5) + "..." + account?.slice(38, 42);

  const dispatch = useDispatch();

  const connectHandler = async () => {
    // Load account
    await loadAccount(provider, dispatch);
  };

  const networkHandler = async (e) => {
    console.log(e.target.value);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }],
    });
  };

  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={logo} className="logo" alt="DApp logo" />
        <h1>DApp Token Exchange</h1>
      </div>

      <div className="exchange__header--networks flex">
        <img src={eth} alt="ETH Logo" className="ETH Logo" />

        {chainId && (
          <select
            name="networks"
            id="networks"
            value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
            onChange={networkHandler}
          >
            <option value="0" disabled>
              Select Network
            </option>
            <option value="0x7A69">Localhost</option>
            <option value="0x4d">kovan</option>
          </select>
        )}
      </div>

      <div className="exchange__header--account flex">
        {balance ? (
          <p>
            <small>My Balance</small>
            {Number(balance).toFixed(4)}
          </p>
        ) : (
          <p>
            <small>My Balance</small>0 ETH
          </p>
        )}

        {account ? (
          <a
            href={
              config[chainId]
                ? `${config[chainId].explorerURL}/address/${account}`
                : `#`
            }
            target="_blank"
            rel="noreferrer"
          >
            {account.slice(0, 5) + "..." + account.slice(38, 42)}
            <Blockies
              seed={account}
              size={10}
              scale={3}
              color="#2187D0"
              bgColor="#F1F2F9"
              spotColor="#767F92"
              className="identicon"
            />
          </a>
        ) : (
          <button className="button" onClick={connectHandler}>
            Connect
          </button>
        )}
        {/*<a href="">{accountDisplay}</a>*/}
      </div>
    </div>
  );
};

export default Navbar;

/*import { useSelector } from "react-redux";
import logo from "../assets/logo.png";

const Navbar = () => {
  const account = useSelector((state) => state.providers.account);
  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={logo} className="logo" alt="DApp logo">
          {" "}
        </img>
        <h1>DApp Token Exchange</h1>
      </div>

      <div className="exchange__header--networks flex"></div>

      <div className="exchange__header--account flex">
       {account ?  <a href="">{account.slice(0, 5) + "..." + account.slice(38, 42)}</a> : <a href=""></a>}
      </div>
    </div>
  );
};

export default Navbar; */
