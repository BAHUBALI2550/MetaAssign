## Requirements
install these requirements
```
npx hardhat install @openzeppelin/contracts
```
```
npx hardhat install @nomiclabs/hardhat-waffle
```
```
npm install chai-as-promised --save-dev
```

## Deployment
To deploy the smart contract on the Sepolia network (or change to deploy on another network), follow these steps:

Set Up Configuration: Ensure that you have your Sepolia credentials (Private Key and Infura/Alchemy URL) saved in a .env file.

Run the Deployment Script: Execute the following command in your terminal:
```
npx hardhat run scripts/deploy.js --network sepolia
```

## Testing
To run the tests for your smart contracts, use the following command:

first change test file to .mjs, 
secondly change hardhat.config.js to hardhat.config.cjs, 
add "type": "module" in package.json

```
npx hardhat test
```

## Future Improvements

1. implementing a dynamic pricing model where the price of NFTs can change based on market demand .

2. Introduce meta-transactions to allow users to purchase NFTs without needing to hold Ether.

3. mechanism to mint multiple NFTs in a single transaction to improve efficiency

4. Integrating with ipfs or other decentralised storage for metadata to make data remain immutable.

5. Review the gas consumption of operations.

## Design Decision 

1. The saleLive boolean flag controls whether NFTs can be purchased. This feature allows the contract owner to toggle the sale status when required.

2. Events (NFTPurchased and NFTMinted) are emitted upon successful NFT purchases and minting. This helps in tracking actions on-chain and facilitating easy access to transaction histories through event logs.

3. The withdrawFunds function enables the owner to withdraw funds from the contract, which ensures that the owner can manage collected funds securely.

