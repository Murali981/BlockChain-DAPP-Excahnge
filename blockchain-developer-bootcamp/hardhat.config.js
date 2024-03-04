require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // It will help us to read the environment variables inside our hardhat project....

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks : {
    localhost : {} // It uses the default local host : 8545  when you leave it in empty curly braces {}....
  },
};
