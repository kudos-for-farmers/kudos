//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "../contracts/dxdao-contracts/contracts/erc20guild/ERC20Guild.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract KudosGuild is ERC20Guild, OwnableUpgradeable {


    function initialize2(
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
        address kudosAddress
    ) public virtual initializer {
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


        callPermissions[kudosAddress]
            [bytes4(keccak256("mint(address,uint256)"))]
            =block.timestamp;
    }
}
