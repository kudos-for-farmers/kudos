//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "../contracts/dxdao-contracts/contracts/erc20guild/ERC20Guild.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract KudosGuildStorage {
    address public kudosToken;
    address public volunteerBoard;
}

contract KudosGuild is ERC20Guild, KudosGuildStorage, OwnableUpgradeable {

    // keccack256("KUDOS_GUILD")
    bytes32 internal constant KUDOS = 0x11d4d7526fd0ec69e71d5a4da1fac6d625eb1fc6600ca6c5fb664e6bcc5b4595;

    function initialize2(
        address _guildToken,
        uint256 _proposalTime,
        uint256 _timeForExecution,
        uint256 _votingPower,
        string memory _guildName,
        uint256 _voteGas,
        uint256 _maxGasPrice,
        uint256 _lockTime,
        uint256 _permissionDelay,
        address _kudosToken,
        address _volunteerBoard
    ) public virtual initializer {
        super.initialize(
            _guildToken,
            _proposalTime,
            _timeForExecution,
            _votingPower,
            _votingPower,
            _guildName,
            _voteGas,
            _maxGasPrice,
            _lockTime,
	        _permissionDelay
        );

        kudosToken = _kudosToken;
        volunteerBoard = _volunteerBoard;

        callPermissions[_kudosToken]
            [bytes4(keccak256("mint(address,uint256)"))]
            =block.timestamp;
        callPermissions[_volunteerBoard]
            [bytes4(keccak256("createTaskNow(address,uint256,uint256,string,string,uint256,bytes"))]
            =block.timestamp;
    }

    function checkKudosGuild() public pure returns (bytes32) {
        return KUDOS;
    }
}
