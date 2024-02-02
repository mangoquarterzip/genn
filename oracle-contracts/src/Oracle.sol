// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract Oracle is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using MessageHashUtils for bytes;
    using ECDSA for bytes32;

    event RandomNumberSubmitted(uint indexed nonce, uint number);
    event ValidatorAdded(address validator);
    event ValidatorRemoved(address validator);

    error Unauthorized();
    error RepeatedNonce();
    error InsufficientSignatures(uint required, uint provided);
    error InvalidChainHash();

    EnumerableSet.AddressSet private validators;
    // TODO: add a circular array for random numbers
    mapping(uint => uint) public randomNumbers;
    // E.g. 62222885110873340773724049848541497560498852390401026073240434735277638005454
    uint public chainHash;
    uint public highestNonce;

    // TODO: add metadata regarding the drand used
    constructor(
        address[] memory _validators,
        uint _chainHash
    ) Ownable(msg.sender) {
        chainHash = _chainHash;
        for (uint256 i = 0; i < _validators.length; i++) {
            validators.add(_validators[i]);
        }
    }

    function getValidators() external view returns (address[] memory) {
        return validators.values();
    }

    function addValidator(address validator) external onlyOwner {
        validators.add(validator);
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        validators.remove(validator);
        emit ValidatorRemoved(validator);
    }

    function getLatestNumber() external view returns (uint) {
        return randomNumbers[highestNonce];
    }

    function submit(
        uint _chainHash,
        uint number,
        uint nonce,
        bytes[] calldata signatures
    ) external {
        bytes32 hashedMessage = abi
            .encode(_chainHash, number, nonce)
            .toEthSignedMessageHash();
        uint requiredSignatures = validators.length() / 2 + 1;
        uint signatureCount = signatures.length;

        if (chainHash != _chainHash) {
            revert InvalidChainHash();
        }

        if (signatureCount < requiredSignatures) {
            revert InsufficientSignatures(
                signatures.length,
                requiredSignatures
            );
        }

        for (uint256 i = 0; i < signatureCount; ) {
            address signer = hashedMessage.recover(signatures[i]);

            if (!validators.contains(signer)) {
                revert Unauthorized();
            }
            // TODO: check that signatures are unique

            unchecked {
                i += 1;
            }
        }

        // Update the nonces
        if (nonce > highestNonce) {
            highestNonce = nonce;
        } else if (randomNumbers[nonce] != 0) {
            revert RepeatedNonce();
        }

        randomNumbers[nonce] = number;

        emit RandomNumberSubmitted(nonce, number);
    }
}
