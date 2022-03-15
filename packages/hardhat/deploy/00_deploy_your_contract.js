// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

//const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const kudosGuildAbi = [

  ]

  await deploy("GuildKudos", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    //args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  await deploy("DAOToken", {
    from: deployer,
    args: [ "DAOKudos", "dKUDO", 0 ],
    log: true,
  });

  const guildKudos = await ethers.getContract("GuildKudos", deployer);
  const daoToken = await ethers.getContract("DAOToken", deployer);

  await deploy("KudosGuild", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ 
    //   daoToken.address,
    //   600000,   // uint256 _proposalTime,
    //   600000,   // uint256 _timeForExecution,
    //   100,      // uint256 _votingPowerForProposalExecution,
    //   100,      // uint256 _votingPowerForProposalCreation,
    //   "Ellen's Cut Flowers",          // string memory _guildName,
    //   100000,   // uint256 _voteGas,
    //   999999,   // uint256 _maxGasPrice,
    //   100,      // uint256 _maxActiveProposals,
    //   60000,    // uint256 _lockTime,
    //   ["Kudos (Ellen's Cut Flowers)", // string memory _kudosName,
    //   "ecfKUDO",                      // string memory _kudosSymbol,
    //   guildKudos.address]
    // ],
    log: true,
  });

  const guild1 = await ethers.getContract("KudosGuild", deployer);

  console.log(guild1);


  // see docs in ERC20Guild.sol for docs
  guild1.functions['initialize(address,uint256,uint256,uint256,uint256,string,uint256,uint256,uint256,uint256,(string,string,address))'](
      daoToken.address,
      600000,   // uint256 _proposalTime,
      600000,   // uint256 _timeForExecution,
      100,      // uint256 _votingPowerForProposalExecution,
      100,      // uint256 _votingPowerForProposalCreation,
      "Ellen's Cut Flowers",          // string memory _guildName,
      100000,   // uint256 _voteGas,
      999999,   // uint256 _maxGasPrice,
      60000,    // uint256 _lockTime,
      600,      // uint256 _permissionDelay, 
      //proxyTokenInitVars memory kudoVars:
      ["Kudos (Ellen's Cut Flowers)", // string memory _kudosName,
      "ecfKUDO",                      // string memory _kudosSymbol,
      guildKudos.address]
  )

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
