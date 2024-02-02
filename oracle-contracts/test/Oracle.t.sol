// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, Vm} from "forge-std/Test.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Oracle} from "../src/Oracle.sol";

contract CounterTest is Test {
    using MessageHashUtils for bytes;
    using ECDSA for bytes32;

    function setUp() public {}

    function test() public {
        uint validatorCount = 100;

        Vm.Wallet[] memory validators = new Vm.Wallet[](validatorCount);
        address[] memory validatorAddresses = new address[](validatorCount);

        uint number = 123;
        uint nonce = 1;
        uint chainHash = 0x8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce;

        bytes32 hashedMessage = abi
            .encode(chainHash, number, nonce)
            .toEthSignedMessageHash();

        bytes[] memory signatures = new bytes[](validatorCount);

        for (uint i = 0; i < validatorCount; i++) {
            validators[i] = vm.createWallet(i + 1);
            validatorAddresses[i] = validators[i].addr;
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(
                validators[i],
                hashedMessage
            );
            signatures[i] = abi.encodePacked(r, s, v);
        }

        Oracle oracle = new Oracle(validatorAddresses, chainHash);

        oracle.submit(chainHash, number, nonce, signatures);
    }

    function test_repeated_nonce() public {
        uint validatorCount = 100;

        Vm.Wallet[] memory validators = new Vm.Wallet[](validatorCount);
        address[] memory validatorAddresses = new address[](validatorCount);

        uint number = 123;
        uint nonce = 1;
        uint chainHash = 0x8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce;

        bytes32 hashedMessage = abi
            .encode(chainHash, number, nonce)
            .toEthSignedMessageHash();

        bytes[] memory signatures = new bytes[](validatorCount);

        for (uint i = 0; i < validatorCount; i++) {
            validators[i] = vm.createWallet(i + 1);
            validatorAddresses[i] = validators[i].addr;
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(
                validators[i],
                hashedMessage
            );
            signatures[i] = abi.encodePacked(r, s, v);
        }

        Oracle oracle = new Oracle(validatorAddresses, chainHash);

        oracle.submit(chainHash, number, nonce, signatures);
        vm.expectRevert(Oracle.RepeatedNonce.selector);
        oracle.submit(chainHash, number, nonce, signatures);
    }
}
