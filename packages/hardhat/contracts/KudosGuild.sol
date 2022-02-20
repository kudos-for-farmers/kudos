pragma solidity ^0.8.8;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "../contracts/dxdao-contracts/contracts/erc20guild/ERC20Guild.sol";
import "../contracts/dxdao-contracts/contracts/utils/GlobalPermissionRegistry.sol";
import "../contracts/GuildKudos.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract KudosGuild is ERC20Guild, OwnableUpgradeable {
    GuildKudos public kudos;

    function initialize(
        address _daoToken,
        address _kudosImpl,
        uint256 _proposalTime,
        uint256 _timeForExecution,
        uint256 _votingPowerForProposalExecution,
        uint256 _votingPowerForProposalCreation,
        string memory _guildName,
        string memory _kudosName,
        string memory _kudosSymbol,
        uint256 _voteGas,
        uint256 _maxGasPrice,
        uint256 _maxActiveProposals,
        uint256 _lockTime
    ) public virtual initializer {
        address clone = Clones.clone(_kudosImpl);
        kudos = GuildKudos(clone);
        kudos.initialize(_kudosName, _kudosSymbol);
        permissionRegistry = new GlobalPermissionRegistry();

        super._initialize(
            _daoToken,
            _proposalTime,
            _timeForExecution,
            _votingPowerForProposalExecution,
            _votingPowerForProposalCreation,
            _guildName,
            _voteGas,
            _maxGasPrice,
            _maxActiveProposals,
            _lockTime,
            address(permissionRegistry)
        );
    }

    function mintKudos(address to, uint256 amount) public onlyOwner {
        if (token.balanceOf(address(this)) >= kudos.totalSupply() + amount) {
            kudos.mint(to, amount);
        } else {
            // Create a new DXdao Guild Proposal in order to mint a greater number
            // of GuildKudos than the Guild's balance of daoToken, which must pass
            // a vote by holders of the daoToken (or maybe the GuildKudos?)
        }
    }
}
