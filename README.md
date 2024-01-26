# Navigator's Challenge 1

## Ways to implement

### Token accounts

Token accounts can be used for the storage of all the information required. The price to create one account is 1 MINA, therefore the total cost of this solution is > 100 MINA.

### Using events and actions storage

This storage is cheap and it is used in this implementation

## Assumptions

The purpose of this challenge is to demonstrate a principal solution, a full solution with UI is not required, therefore to simplify the code we can use the following assumptions that do not contradict the challenge's text:

- Testing on a local blockchain is enough. This will allow us to omit the parts of the code that
  - fetch accounts from the Mina node
  - handle nonce and transaction fee
  - handle instability of the archive node
- Archive node storage is a suitable data structure. Actions are stored on the archive node and not in the blockchain state.
- There is no requirement for the sender address would be a part of the proof. This will allow the use this.sender instead of the signatures that will be needed otherwise, before the [additions to the protocol](https://discord.com/channels/484437221055922177/1185288593099456565/1198532575724044398).
- The last 6 bits mean lower bits, with the lowest bit being a number-one.

## Installation

```
git clone https://github.com/dfstio/nc1
cd nc1
yarn
```

## Running

```
yarn test
```

## Test results

```
nc1 % yarn test
[12:05:32 AM] Compiling the SmartContract...
[12:05:34 AM] compiled: 2.018s
[12:05:35 AM] Created users: 2.211ms
[12:05:35 AM] Created messages: 0.038ms
[12:05:36 AM] Funded user's accounts: 1.055s
[12:06:00 AM] Added users: 10.975s
[12:06:20 AM] Sent messages: 20.709s
 PASS  ./message.test.ts
  Message SmartContract
    ✓ should compile the SmartContract (2028 ms)
    ✓ should deploy the SmartContract (534 ms)
    ✓ should create users (2 ms)
    ✓ should create messages (1 ms)
    ✓ should fund users's accounts (1055 ms)
    ✓ should add first users's address to the contract storage (12607 ms)
    ✓ should not add first users's address second time to the contract storage (84 ms)
    ✓ should not add user from non-admin account (71 ms)
    ✓ should add users's addresses to the contract storage (10975 ms)
    ✓ should not add extra user (94 ms)
    ✓ should send messages from users (20709 ms)
    ✓ should check events (3 ms)
    ✓ should not send message second time (88 ms)
    ✓ should not send message from extra user (75 ms)
    ✓ should check the counter (3 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        49.616 s
Ran all test suites matching /message.test.ts/i.

```

## References

### Actions and Reducer

- Documentation

https://docs.minaprotocol.com/zkapps/o1js/actions-and-reducer

- Examples

https://github.com/o1-labs/o1js/tree/main/src/examples/zkapps/reducer

- Discussion

https://github.com/o1-labs/o1js/pull/1300

### Bitwise operations

- Documentation

https://docs.minaprotocol.com/zkapps/o1js/bitwise-operations

- Article

https://blog.o1labs.org/whats-new-in-o1js-january-2024-ea2a38b6bd6c

- Discussions

https://discord.com/channels/484437221055922177/1195376536379994132
https://discord.com/channels/484437221055922177/915745847692636181/1038786367532056586
https://discord.com/channels/484437221055922177/915745847692636181/1006821136450990161
https://discord.com/channels/484437221055922177/915745847692636181/1006821143241555979
