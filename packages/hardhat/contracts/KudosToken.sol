//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "./AllocationToken.sol";
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
    AllocationToken public allocation;
    // Map Guild addresses to the total amount of Kudos minted by that Guild
    mapping(address => uint256) public mintedByGuild;

    function initialize(string memory name, string memory symbol, address allocationToken) initializer public {
        allocation = AllocationToken(allocationToken);
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
        require(allocation.balanceOf(msg.sender) >= mintedByGuild[msg.sender] + amount, 
                "This Guild does not have a sufficient allocation to mint the requested number of Kudos.");
        mintedByGuild[msg.sender] += amount;
        _mint(to, amount);
    }

    // Kudos are non-transferable
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) 
    {
        return false;
    }
}
