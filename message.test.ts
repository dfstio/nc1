// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { describe, expect, it } from "@jest/globals";
import { Field, PrivateKey, PublicKey, Mina, AccountUpdate } from "o1js";
import { Message, MAX_USERS } from "./message";

const NUMBER_OF_USERS = MAX_USERS;

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
  const extraUserPrivateKey =
    Local.testAccounts[NUMBER_OF_USERS + 1].privateKey;
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
    });
    await tx.sign([adminPrivateKey, zkAppPrivateKey]).send();
  });

  it(`should create users`, async () => {
    console.time("Created users");
    for (let i = 0; i < NUMBER_OF_USERS; i++) {
      const userPrivateKey = Local.testAccounts[i + 1].privateKey;
      usersPrivateKeys.push(userPrivateKey);
      users.push(userPrivateKey.toPublicKey());
    }
    console.timeEnd("Created users");
  });

  it(`should add users's addresses to the contract storage`, async () => {
    console.time("Added users");
    for (const user of users) {
      const tx = await Mina.transaction({ sender: admin }, () => {
        zkApp.add(user);
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

  //it(`should `, async () => {});
});
