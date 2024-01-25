# Navigator's Challenge 1

## Ways to implement

### Token accounts

Token accounts can be used for the storage of all the information required. The price to create one account is 1 MINA, therefore the total cost of this solution is > 100 MINA.

### Using events and actions storage

This storage is cheap and it is used in this implementation

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
[11:33:14 PM] Compiling the SmartContract...
[11:33:22 PM] compiled: 7.770s
[11:33:22 PM] Created users: 2.223ms
[11:33:23 PM] Funded user's accounts: 1.071s
[11:33:44 PM] Added users: 10.434s
[11:34:05 PM] Sent messages: 20.126s
 PASS  ./message.test.ts
  Message SmartContract
    ✓ should compile the SmartContract (7779 ms)
    ✓ should deploy the SmartContract (529 ms)
    ✓ should create users (2 ms)
    ✓ should fund users's accounts (1071 ms)
    ✓ should add first users's address to the contract storage (10582 ms)
    ✓ should not add first users's address second time to the contract storage (92 ms)
    ✓ should not add user from non-admin account (72 ms)
    ✓ should add users's addresses to the contract storage (10435 ms)
    ✓ should not add extra user (92 ms)
    ✓ should send messages from users (20126 ms)
    ✓ should not send message second time (90 ms)
    ✓ should not send messages from extra user (76 ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        52.193 s
Ran all test suites matching /message.test.ts/i.

```
