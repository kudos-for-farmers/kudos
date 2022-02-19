pragma solidity >=0.8.4 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "../contracts/dxdao-contracts/contracts/erc20guild/ERC20Guild.sol";
import "../contracts/GuildKudos.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract KudosGuild is ERC20Guild {
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
        uint256 _lockTime,
        address _permissionRegistry
    ) public virtual initializer {
        address clone = Clones.clone(_kudosImpl);
        kudos = GuildKudos(clone);
        kudos.initialize(_kudosName, _kudosSymbol);
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
            _permissionRegistry
        );
    }

    function mint(address to, uint256 amount) 
}
