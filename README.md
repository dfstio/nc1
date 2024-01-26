# Navigator's Challenge 1

## Ways to implement

### Token accounts

Token accounts can be used for the storage of all the information required. The price to create one account is 1 MINA, therefore the total cost of this solution is > 100 MINA. This solution is being used in [MinaNFT library](https://github.com/dfstio/minanft-lib/blob/master/src/contract/names.ts#L71)

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

## Test

### Running test

```
yarn test
```

To make testing faster, you can temporarily change MAX_USERS from 100 to 10 and compile the contract two times before the testing.

### Test coverage

```
yarn coverage
```

Test coverage is 100 percent. Details are in the jest report in the coverage folder.

```
------------|---------|----------|---------|---------|-------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------|---------|----------|---------|---------|-------------------
All files   |     100 |      100 |     100 |     100 |
 message.ts |     100 |      100 |     100 |     100 |
------------|---------|----------|---------|---------|-------------------
```

### Test results

```
nc1 % yarn test
[5:29:47 PM] Compiling the SmartContract...
[5:29:50 PM] compiled: 3.313s
[5:29:51 PM] Created users: 10.78ms
[5:29:51 PM] Created messages: 0.636ms
[5:29:56 PM] Funded user's accounts: 5.071s
[5:30:08 PM] Added first user: 12.010s
[5:31:43 PM] Added users: 1:34.845 (m:ss.mmm)
[5:31:47 PM] Sent invalid messages: 3.492s
[5:31:58 PM] Sent first message: 10.765s
[5:33:34 PM] Sent messages: 1:36.197 (m:ss.mmm)
 PASS  ./message.test.ts
  Message SmartContract
    ✓ should test conversion from field to boolean (1 ms)
    ✓ should compile the SmartContract (3322 ms)
    ✓ should deploy the SmartContract (505 ms)
    ✓ should create users (10 ms)
    ✓ should create messages
    ✓ should fund users's accounts (5071 ms)
    ✓ should add first users's address to the contract storage (12010 ms)
    ✓ should not add first users's address second time to the contract storage (297 ms)
    ✓ should not add user from non-admin account (287 ms)
    ✓ should add users's addresses to the contract storage (94847 ms)
    ✓ should not add extra user (444 ms)
    ✓ should not send messages with invalid flags (3594 ms)
    ✓ should send first message from user (10867 ms)
    ✓ should send messages from users (96298 ms)
    ✓ should check events (107 ms)
    ✓ should not send message second time (465 ms)
    ✓ should not send message from extra user (400 ms)
    ✓ should check the counter (106 ms)

Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        229.745 s, estimated 258 s
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
