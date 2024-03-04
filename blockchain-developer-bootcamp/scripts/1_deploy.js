// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  console.log('Preparing deployment....');


   // Step 1. Fetch  contract to deploy.
     const Token = await ethers.getContractFactory('Token'); // We use the ethers library and calling getContractFactory()....
     // It gets all the necessary information from the artifacts folder....

     const Exchange = await ethers.getContractFactory('Exchange');
     
     // Fetch accounts...

     const accounts = await ethers.getSigners() // We will get all the accounts...

     console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`) // We are using the accounts[1] as a fee account....

   // Step 2. Deploy contract
   const dapp = await Token.deploy('Dapp University' , 'DAPP' , '1000000'); //  This deploy() is writing it into the blockchain.....
   await dapp.deployed() , // We can get the information that was deployed and loaded into our smart contract.....
   console.log(`Dapp token deployed to ${dapp.address}`); 

   const mETH = await Token.deploy('mETH' , 'mETH' , '1000000'); //  This deploy() is writing it into the blockchain.....
   await mETH.deployed() , // We can get the information that was deployed and loaded into our smart contract.....
   console.log(`mETH token deployed to ${mETH.address}`); 

   const mDAI = await Token.deploy('mDAI' , 'mDAI' , '1000000'); //  This deploy() is writing it into the blockchain.....
   await mDAI.deployed() , // We can get the information that was deployed and loaded into our smart contract.....
   console.log(`mDAI token deployed to ${mDAI.address}`); 

   const exchange = await Exchange.deploy(accounts[1].address , 10)
   await exchange.deployed()
   console.log(`Exchange Deployed to : ${exchange.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
