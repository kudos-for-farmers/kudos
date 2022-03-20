//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "./AllocationToken.sol";
import "./KudosToken.sol";
import "./KudosGuild.sol";
import "../contracts/dxdao-contracts/contracts/utils/Arrays.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/MathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract KudosVolunteerBoard is ReentrancyGuardUpgradeable, PausableUpgradeable {
    using SafeMathUpgradeable for uint256;
    using MathUpgradeable for uint256;
    using Arrays for uint256[];

    AllocationToken daoToken;
    KudosToken kudos;
    uint256 public taskNonce;
    bool public initialized = false;
    bytes32[] public taskIds;

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
        bytes   contentHash;
    }
    mapping(bytes32 => VolunteerTask) tasks;

    event TaskCreated(bytes32 indexed taskId);

    modifier onlyKudosGuild() {
        require(KudosGuild(msg.sender).checkKudosGuild() == keccak256("KUDOS_GUILD"), "Only a Kudos Guild contract may call this function.");
        _;
    }

    modifier isInitialized() {
        require(initialized, "KudosVolunteerBoard contract not initialized");
        _;
    }

    function initialize(
        address _daoToken,
        address _kudosToken
    ) public virtual initializer {
        daoToken = AllocationToken(_daoToken);
        kudos = KudosToken(_kudosToken);
        taskNonce = 0;
        initialized = true;
    }

    function createTaskNow(
        address _creator,
        uint256 _duration,
        uint256 _kudosReward,
        string memory _taskName,
        string memory _description,
        uint256 _maxClaims,
        bytes memory _contentHash
    ) public nonReentrant whenNotPaused onlyKudosGuild isInitialized returns (bytes32) {
        require(daoToken.balanceOf(msg.sender) >= kudos.mintedByGuild(msg.sender) + _kudosReward * _maxClaims, "Guild does not have sufficient allocation.");
        return _createTask(_creator, block.timestamp, block.timestamp.add(_duration), _kudosReward, _taskName, _description, _maxClaims, _contentHash);
    }

    function _createTask(
        address _creator,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _kudosReward,
        string memory _taskName,
        string memory _description,
        uint256 _maxClaims,
        bytes memory _contentHash
    ) internal returns (bytes32) {
        bytes32 taskId =
            keccak256(
                abi.encodePacked(msg.sender, block.timestamp, taskNonce)
            );
        taskNonce = taskNonce.add(1);
        VolunteerTask storage newTask = tasks[taskId];
        newTask.creator = _creator;
        newTask.startTime = _startTime;
        newTask.endTime = _endTime;
        newTask.kudosReward = _kudosReward;
        newTask.taskName = _taskName;
        newTask.description = _description;
        newTask.maxClaims = _maxClaims;
        newTask.kudosRemaining = _kudosReward;
        newTask.contentHash = _contentHash;

        emit TaskCreated(taskId);
        taskIds.push(taskId);
        return taskId;
    }

}
