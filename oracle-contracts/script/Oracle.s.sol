// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {Oracle} from "src/Oracle.sol";

contract Deployment is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address validator = vm.addr(deployerPrivateKey);
        uint chainHash = 0x52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971;

        address[] memory validators = new address[](1);
        validators[0] = validator;

        vm.startBroadcast(deployerPrivateKey);

        new Oracle(validators, chainHash);

        vm.stopBroadcast();
    }
}
