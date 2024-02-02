# Genn Project

Random Number Oracle seeding from Drand (League of Entropy). It is a validator network that allows random numbers to be verified and sent to any EVM compatible network.

## Technology Stack

- Oracle Smart Contracts
  - Lives on Areon network and holds the incoming new numbers submitted by the network.
  - Other contracts can consume the new incoming random numbers on the contract
  - It tracks a list of validators in the network and requires sufficient signatures
- Validator Node
  - A node built using NodeJs
  - It listens to new numbers generated by Drand and verifies them and broadcasts them within the validator network
  - Then a random leader is selected and sends the transaction with all the signatures. A majority is required (half min.)
  - Currently some validators are deployed on DigitalOcean backend service
  - However the client is very light and can virtually run anywhere
  - It has also been dockerised so it can run in any platform without issues
- Web Dashboard
  - Built using NextJs to show all the new numbers coming into the oracle contract. And see the status of the validators

## Contracts

- `Oracle`: [testnet link](https://areonscan.com/contracts/0x70c83e645012c78278814babe8e4f57f32b192e4)