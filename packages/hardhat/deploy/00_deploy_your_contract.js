// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

//const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("AllocationToken", {
    from: deployer,
    log: true,
  });
  const allocationToken = await ethers.getContract("AllocationToken", deployer);
  try {
    await allocationToken.functions.initialize("foodDAO Allocation", "fDAO");
  } catch (e) {
  }

  await deploy("GuildVotingToken", {
    from: deployer,
    log: true,
  });
  const votingToken = await ethers.getContract("GuildVotingToken");
  try {
    await votingToken.functions.initialize("SLV-co-op", "SLV");
  } catch (e) {
  }

  await deploy("KudosToken", {
    from: deployer,
    log: true,
  });
  const kudosToken = await ethers.getContract("KudosToken", deployer);
  try {
    await kudosToken.functions.initialize("Kudos", "KUDO", allocationToken.address);
  } catch (e) {
  }

  await deploy("KudosGuild", {
    from: deployer,
    log: true,
  });
  const kudosGuild = await ethers.getContract("KudosGuild");

  try{
    // // see docs in ERC20Guild.sol for docs
    await kudosGuild.functions.initialize2(
      votingToken.address,
      120,   // uint256 _proposalTime,
      600000,   // uint256 _timeForExecution,
      1,      // uint256 _votingPowerForProposalExecution,
      1,      // unt256 _votingPowerForProposalCreation,
      "San-Louise-Valley CoOp",          // string memory _guildName,
      100000,   // uint256 _voteGas,
      999999,   // uint256 _maxGasPrice,
      60000,    // uint256 _lockTime,
      600,      // uint256 _permissionDelay,
      kudosToken.address,
    );
  } catch (e) {
  }

  //TODO need to check if we are the owner first, since hardhat will reuse our contracts.
  // also, being the owner is a convinient way to mint tokens in dev... someone needs to be
  // able to vote in the dao.
  //await votingToken.transferOwnership(kudosGuild.address);
  //console.log("GuildVotingToken owner = " + await votingToken.functions.owner());

  // deploy "guild" for each co-op or org that can dole out kudos
  // kudo recipients are individual "addresses" (behind an email)
  // have another "super-guild" that can deploy new guilds??





  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");

    To take ownership of yourContract using the ownable library uncomment next line and add the
    address you want to be the owner.
    // yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

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
};
module.exports.tags = ["KudosGuild"];
