/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const { config, ethers, tenderly, run } = require("hardhat");
const { utils } = require("ethers");

const main = async () => {
  console.log("\n\n 📡 Minting...\n");

  const allocationTokens = await ethers.getContract('AllocationToken');
  const votingTokens = await ethers.getContract('GuildVotingToken');
  const guild = await ethers.getContract('KudosGuild');
	await votingTokens.functions.mint(
		"0x2965e453EC5D8E719f7314aAfb6F136C75b03D35",
		1000
	);

	await allocationTokens.functions.mint(
		guild.address,
		1000
	);

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  //If you want to verify your contract on tenderly.co (see setup details in the scaffold-eth README!)
  /*
  await tenderlyVerify(
    {contractName: "YourContract",
     contractAddress: yourContract.address
  })
  */
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
