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

    address public daoToken;
    address public kudos;
    uint256 public taskNonce;
    bool public initialized = false;
    bytes32[] public taskIds;
    // keccack256("KUDOS_VOLUNTEER_BOARD")
    bytes32 internal constant KUDOS_VOLUNTEER_BOARD = 0x054825a47b9cc6bed10b535eda45fa520a7f596c850137c8d5a5bf0b06a75da8;

    struct VolunteerTask {
        address creator;
        address guildAddress;
        uint256 startTime;
        uint256 endTime;
        uint256 kudosReward;
        string  taskName;
        string  description;
        uint256 maxClaims;
        bytes   contentHash;
        mapping(address => uint256) claimedBy;
    }
    mapping(bytes32 => VolunteerTask) public tasks;

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
        daoToken = _daoToken;
        kudos = _kudosToken;
        taskNonce = 0;
        initialized = true;
    }

    function checkVolunteerBoard() public pure returns (bytes32) {
        return KUDOS_VOLUNTEER_BOARD;
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
        return _createTask(_creator, block.timestamp, block.timestamp.add(_duration), _kudosReward, _taskName, _description, _maxClaims, _contentHash);
    }

    function claimTaskReward(
        bytes32 taskId
    ) public nonReentrant whenNotPaused isInitialized returns (bool) {
        VolunteerTask storage task = tasks[taskId];
        require(task.startTime < block.timestamp, "Task has not begun yet.");
        require(task.endTime >= block.timestamp, "Task has already ended.");
        require(task.maxClaims > 0, "Task has already been claimed the maximum number of times.");

        task.maxClaims -= 1;
        task.claimedBy[_msgSender()] += task.kudosReward;

        return KudosToken(kudos).mintFromCommitted(task.guildAddress, _msgSender(), taskId, task.kudosReward);
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
                abi.encodePacked(_msgSender(), block.timestamp, taskNonce)
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
        newTask.contentHash = _contentHash;
        newTask.guildAddress = _msgSender();

        require(
            KudosToken(kudos).commitToReward(_msgSender(), taskId, _kudosReward * _maxClaims),
            "Failed to commit to Kudos reward for new VolunteerTask. Aborting."
        );

        emit TaskCreated(taskId);
        taskIds.push(taskId);
        return taskId;
    }

}
