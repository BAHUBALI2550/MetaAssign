const { ethers } = require("hardhat");

async function main() {
    const NFTSTORE = await ethers.getContractFactory("NFTSTORE");
    console.log("Deploying the NFTSTORE contract...");
    const nftStore = await NFTSTORE.deploy();
    await nftStore.deployed();

    console.log(`NFTSTORE deployed at address: ${nftStore.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


