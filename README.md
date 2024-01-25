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
