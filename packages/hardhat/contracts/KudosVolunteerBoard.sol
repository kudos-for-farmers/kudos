//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "./AllocationToken.sol";
import "./KudosToken.sol";
import "./KudosGuild.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract KudosVolunteerBoard is ReentrancyGuardUpgradeable, PausableUpgradeable {

    AllocationToken daoToken;
    KudosToken kudos;

    struct VolunteerTask {
        address creator;
        address guildAddress;
        uint256 startTime;
        uint256 endTime;
        uint256 kudosReward;
        string  taskName;
        string  description;
        uint256 maxClaims;
        uint256 kudosRemaining;
        bytes contentHash;
    }
    mapping(bytes32 => VolunteerTask) tasks;

    function initialize(
        address _daoToken,
        address _kudosToken
    ) public virtual initializer {
        daoToken = AllocationToken(_daoToken);
        kudos = KudosToken(_kudosToken);
    }

}
