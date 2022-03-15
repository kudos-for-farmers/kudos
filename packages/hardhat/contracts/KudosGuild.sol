//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "../contracts/dxdao-contracts/contracts/erc20guild/ERC20Guild.sol";
import "../contracts/GuildKudos.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract KudosGuild is ERC20Guild, OwnableUpgradeable {
    // GuildKudos public kudos;



    function initialize(
        address _daoToken,
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
            _daoToken,
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
    }

    function mintKudos(address to, uint256 amount) public onlyOwner {
        // if (token.balanceOf(address(this)) >= token.totalSupply() + amount) {
        //     token.mint(to, amount);
        // } else {
        //     // Create a new DXdao Guild Proposal in order to mint a greater number
        //     // of GuildKudos than the Guild's balance of daoToken, which must pass
        //     // a vote by holders of the daoToken (or maybe the GuildKudos?)
        // }
    }
}
