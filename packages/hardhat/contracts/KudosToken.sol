//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "./AllocationToken.sol";
import "./KudosVolunteerBoard.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

/// @title KudosToken
/// @dev A non-transferable rewards token for FoodDAO which is issued by Kudos Guilds.
/// A Guild contract can only mint as many Kudos tokens as its balance of AllocationToken.
/// Many Guilds use the same KudosToken and AllocationToken, so we must track how many Kudos
/// have been minted by a given address and store a reference to the AllocationToken contract.
contract KudosToken is Initializable, ERC20Upgradeable, PausableUpgradeable, OwnableUpgradeable {
    // Non-transferable Allocations from the DAO are minted to each Guild on a regular (or streaming) basis
    address public allocation;
    // Map Guild addresses to the total amount of Kudos minted by that Guild
    mapping(address => uint256) public mintedByGuild;
    // Map Guild addresses to the total amount of Kudos committed to but not yet minted by that Guild
    mapping(address => uint256) public committedByGuild;
    // Map task IDs to the total amount of Kudos committed to but not yet minted as reward for that Task
    mapping(bytes32 => uint256) public committedToTask;

    function initialize(
        string memory name, 
        string memory symbol, 
        address allocationToken
    ) initializer public {
        allocation = allocationToken;
        __ERC20_init(name, symbol);
        __Pausable_init();
        __Ownable_init();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public {
        require(
            AllocationToken(allocation).balanceOf(_msgSender()) >= mintedByGuild[_msgSender()] + committedByGuild[_msgSender()] + amount, 
            "This Guild does not have a sufficient allocation to mint the requested number of Kudos."
        );
        mintedByGuild[_msgSender()] += amount;
        _mint(to, amount);
    }

    function mintFromCommitted(address from, address to, bytes32 taskId, uint256 amount) public returns (bool) {
        require(
            KudosVolunteerBoard(_msgSender()).checkVolunteerBoard() == keccak256("KUDOS_VOLUNTEER_BOARD"),
            "Only the KudosVolunteerBoard may call mintFromCommitted"
        );
        require(
            committedToTask[taskId] >= amount, 
            "There are not enough Kudos committed to this task."
        );
        committedToTask[taskId] -= amount;
        require(
            committedByGuild[from] >= amount,
            "This Guild has not committed enough Kudos."
        );
        committedByGuild[from] -= amount;
        require(
            AllocationToken(allocation).balanceOf(from) >= mintedByGuild[from] + committedByGuild[from] + amount, 
            "This Guild does not have a sufficient allocation to mint the requested number of Kudos."
        );
        mintedByGuild[from] += amount;
        _mint(to, amount);
        return true;
    }

    function commitToReward(address guild, bytes32 taskId, uint256 amount) public returns (bool) {
        require(
            KudosVolunteerBoard(_msgSender()).checkVolunteerBoard() == keccak256("KUDOS_VOLUNTEER_BOARD"),
            "Only the KudosVolunteerBoard may call commitToReward"
        );
        require(
            AllocationToken(allocation).balanceOf(guild) >= mintedByGuild[guild] + committedByGuild[guild] + amount, 
            "This Guild does not have a sufficient allocation to commit the requested number of Kudos."
        );
        committedByGuild[guild] += amount;
        committedToTask[taskId] += amount;
        return true;
    }

    // Kudos are non-transferable
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) 
    {
        return false;
    }
}
