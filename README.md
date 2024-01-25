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
[10:39:44 PM] Compiling the SmartContract...
[10:39:46 PM] compiled: 1.705s
[10:39:47 PM] Created users: 1.741ms
[10:40:07 PM] Added users: 20.161s
[10:40:24 PM] Sent messages: 17.579s
 PASS  ./message.test.ts
  Message SmartContract
    ✓ should compile the SmartContract (1714 ms)
    ✓ should deploy the SmartContract (520 ms)
    ✓ should create users (2 ms)
    ✓ should add users's addresses to the contract storage (20162 ms)
    ✓ should not add extra user (37 ms)
    ✓ should send messages from users (17579 ms)
    ✓ should not send messages from extra user (28 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        41.219 s, estimated 47 s
Ran all test suites matching /message.test.ts/i.
```
