/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.URL,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
