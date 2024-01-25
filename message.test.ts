// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { describe, expect, it } from "@jest/globals";
import {
  Field,
  PrivateKey,
  PublicKey,
  Mina,
  AccountUpdate,
  UInt32,
} from "o1js";
import { Message, MAX_USERS } from "./message";

const NUMBER_OF_USERS = MAX_USERS;
const FAUCET_AMOUNT = 1_000_000_000n;

describe("Message SmartContract", () => {
  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const adminPrivateKey = Local.testAccounts[0].privateKey;
  const admin = adminPrivateKey.toPublicKey();
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
  const zkApp = new Message(zkAppPublicKey);
  const usersPrivateKeys: PrivateKey[] = [];
  const users: PublicKey[] = [];
  const extraUserPrivateKey = Local.testAccounts[1].privateKey;
  const extraUser = extraUserPrivateKey.toPublicKey();

  it(`should compile the SmartContract`, async () => {
    console.log("Compiling the SmartContract...");
    console.time("compiled");
    await Message.compile();
    console.timeEnd("compiled");
  });

  it(`should deploy the SmartContract`, async () => {
    const tx = await Mina.transaction({ sender: admin }, () => {
      AccountUpdate.fundNewAccount(admin);
      zkApp.deploy({});
      zkApp.admin.set(admin);
      zkApp.counter.set(UInt32.from(0));
    });
    await tx.sign([adminPrivateKey, zkAppPrivateKey]).send();
  });

  it(`should create users`, async () => {
    console.time("Created users");
    for (let i = 0; i < NUMBER_OF_USERS; i++) {
      const userPrivateKey = PrivateKey.random();
      usersPrivateKeys.push(userPrivateKey);
      users.push(userPrivateKey.toPublicKey());
    }
    console.timeEnd("Created users");
  });

  it(`should fund users's accounts`, async () => {
    console.time("Funded user's accounts");
    const faucetPrivateKey = Local.testAccounts[2].privateKey;
    const faucet = faucetPrivateKey.toPublicKey();
    for (const user of users) {
      const tx = await Mina.transaction({ sender: faucet }, () => {
        AccountUpdate.fundNewAccount(faucet);
        const senderUpdate = AccountUpdate.create(faucet);
        senderUpdate.requireSignature();
        senderUpdate.send({ to: user, amount: FAUCET_AMOUNT });
      });
      await tx.sign([faucetPrivateKey]).send();
    }
    console.timeEnd("Funded user's accounts");
  });

  it(`should add first users's address to the contract storage`, async () => {
    const tx = await Mina.transaction({ sender: admin }, () => {
      zkApp.add(users[0]);
    });
    await tx.prove();
    await tx.sign([adminPrivateKey]).send();
  });

  it(`should not add first users's address second time to the contract storage`, async () => {
    let added = true;
    try {
      await Mina.transaction({ sender: admin }, () => {
        zkApp.add(users[0]);
      });
    } catch (e) {
      added = false;
    }
    expect(added).toBe(false);
  });

  it(`should not add user from non-admin account`, async () => {
    let added = true;
    const address = PrivateKey.random().toPublicKey();
    try {
      await Mina.transaction({ sender: extraUser }, () => {
        zkApp.add(address);
      });
    } catch (e) {
      added = false;
    }
    expect(added).toBe(false);
  });

  it(`should add users's addresses to the contract storage`, async () => {
    console.time("Added users");
    for (let i = 1; i < NUMBER_OF_USERS; i++) {
      const tx = await Mina.transaction({ sender: admin }, () => {
        zkApp.add(users[i]);
      });
      await tx.prove();
      await tx.sign([adminPrivateKey]).send();
    }
    console.timeEnd("Added users");
  });

  it(`should not add extra user`, async () => {
    let added = true;
    try {
      await Mina.transaction({ sender: admin }, () => {
        zkApp.add(extraUser);
      });
    } catch (e) {
      added = false;
    }
    expect(added).toBe(false);
  });

  it(`should send messages from users`, async () => {
    console.time("Sent messages");
    for (let i = 0; i < NUMBER_OF_USERS; i++) {
      const tx = await Mina.transaction({ sender: users[i] }, () => {
        zkApp.sendMessage(Field.random());
      });
      await tx.prove();
      await tx.sign([usersPrivateKeys[i]]).send();
    }
    console.timeEnd("Sent messages");
  });

  it(`should not send message second time`, async () => {
    let sent = true;
    try {
      await Mina.transaction({ sender: users[0] }, () => {
        zkApp.sendMessage(Field.random());
      });
    } catch (e) {
      sent = false;
    }
    expect(sent).toBe(false);
  });

  it(`should not send messages from extra user`, async () => {
    let sent = true;
    try {
      await Mina.transaction({ sender: extraUser }, () => {
        zkApp.sendMessage(Field.random());
      });
    } catch (e) {
      sent = false;
    }
    expect(sent).toBe(false);
  });
});
