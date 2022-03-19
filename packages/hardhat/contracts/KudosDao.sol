//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "../contracts/dxdao-contracts/contracts/erc20guild/ERC20Guild.sol";
import "../contracts/DaoToken.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract KudosGuild is ERC20Guild, OwnableUpgradeable {
    DaoToken public daoToken;


function initialize(
        DaoToken _daoToken,
        uint256 _proposalTime,
        uint256 _timeForExecution,
        uint256 _votingPowerForProposalExecution,
        uint256 _votingPowerForProposalCreation,
        string memory _guildName,
        uint256 _voteGas,
        uint256 _maxGasPrice,
        uint256 _lockTime,
        uint256 _permissionDelay,
        proxyTokenInitVars memory kudoVars
    ) public virtual initializer {
        // address clone = Clones.clone(_kudosImpl);
        // kudos = GuildKudos(clone);
        // kudos.initialize(_kudosName, _kudosSymbol);


        super.initialize(
            address(_daoToken),
            _proposalTime,
            _timeForExecution,
            _votingPowerForProposalExecution,
            _votingPowerForProposalCreation,
            _guildName,
            _voteGas,
            _maxGasPrice,
            _lockTime,
	    _permissionDelay
        );

	super.setAllowance(
	  to,
	  functionSig,
	  allowance,
	)
    }

    function proposeReward(address to, uint256 amount, string description) public {
      //TODO submit a proposal to the ERC20 guild to call the mint function of the DAOToken...
      super.createProposal(
         to,
	 data,
	 value,
	 description,
	 contentHash,
      )
    }

}
