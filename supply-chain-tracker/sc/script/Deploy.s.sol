// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

/**
 * @title Deploy
 * @dev Deployment script for SupplyChain contract
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        SupplyChain supplyChain = new SupplyChain();
        
        console.log("SupplyChain deployed at:", address(supplyChain));
        console.log("Admin address:", supplyChain.admin());

        vm.stopBroadcast();
    }
}
