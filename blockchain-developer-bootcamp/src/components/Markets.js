import { useSelector, useDispatch } from "react-redux";
import config from "../config.json";

import { loadTokens } from "../store/interactions";

const Navbar = () => {
  const provider = useSelector((state) => state.providers.connection);
  const chainId = useSelector((state) => state.providers.chainId);

  const dispatch = useDispatch();

  const marketHandler = async (e) => {
    loadTokens(provider, e.target.value.split(","), dispatch);
  };
  return (
    <div className="component exchange__markets">
      <div className="component__header">
        <h2>Select Market</h2>
      </div>

      {chainId && config[chainId] ? (
        <select name="markets" id="markets" onChange={marketHandler}>
          <option
            value={`${config[chainId].DApp.address} , ${config[chainId].mETH.address}`}
          >
            DApp / mETH
          </option>
          <option
            value={`${config[chainId].DApp.address} , ${config[chainId].mDAI.address}`}
          >
            DApp / mDAI
          </option>
        </select>
      ) : (
        <div>
          <p>Not deployed to network</p>
        </div>
      )}

      <hr />
    </div>
  );
};

export default Navbar;
