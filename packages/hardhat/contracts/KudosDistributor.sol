//SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "../contracts/dxdao-contracts/contracts/erc20guild/ERC20Guild.sol";
import "../contracts/GuildKudos.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract KudosDistributor is OwnableUpgradeable {
    KudosToken public kudoToken;
    DaoToken public daoToken;
    uint256 public kudosMinted;



    function initialize(
        DaoToken _daoToken,
        KudosToken _kudoToken,
    ) public virtual initializer {
        kudoToken=_kudoToken;
        daoToken=_daoToken;
        kudosMinted=0;
    }

    function mintKudos(address to, uint256 amount) public onlyOwner {
        //only mint if we have enough DAO tokens left to cover it.
        require(daoToken.balanceOf(address(this))-kudosMinted >= amount);
        kudoToken.mint(to, amount);
    }
}
