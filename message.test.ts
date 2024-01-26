import { describe, expect, it } from "@jest/globals";
import {
  Field,
  PrivateKey,
  PublicKey,
  Mina,
  AccountUpdate,
  UInt32,
  Cache,
} from "o1js";
import { Message, MAX_USERS, MessageEvent } from "./message";

const NUMBER_OF_USERS = MAX_USERS;
const FAUCET_AMOUNT = 1_000_000_000n;
const DEBUG = false;

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
  const messages: Field[] = [];
  const invalidMessages: Field[] = [];

  it(`should test conversion from field to boolean`, async () => {
    const numbers = [0, 0xff, 0x3f, 0x7f, 0x80];
    const answers = [0, 0x3f, 0x3f, 0x3f, 0x00];
    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i];
      const message = Field.from(number);
      const bits = fieldToBoolean(message);
      expect(bits.length).toBe(7);
      let answer = 0;
      for (const bit of bits) answer = (answer << 1) | (bit ? 1 : 0);
      expect(answer).toBe(answers[i]);
    }
  });

  it(`should compile the SmartContract`, async () => {
    console.log("Compiling the SmartContract...");
    const cache: Cache = Cache.FileSystem("./cache");
    console.time("compiled");
    await Message.compile({ cache });
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

  it(`should create messages`, async () => {
    console.time("Created messages");
    while (
      messages.length < NUMBER_OF_USERS ||
      invalidMessages.length < NUMBER_OF_USERS
    ) {
      const message = Field.random();
      const isValid = isMessageValid(message);
      if (isValid && messages.length < NUMBER_OF_USERS) {
        messages.push(message);
      } else if (!isValid && invalidMessages.length < NUMBER_OF_USERS) {
        invalidMessages.push(message);
      }
    }
    console.timeEnd("Created messages");
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
    console.time("Added first user");
    const tx = await Mina.transaction({ sender: admin }, () => {
      zkApp.add(users[0]);
    });
    await tx.prove();
    await tx.sign([adminPrivateKey]).send();
    console.timeEnd("Added first user");
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
      await Memory.info(`Added ${i + 1} users`);
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
    await Memory.info(`should not add extra user`);
  });

  it(`should not send messages with invalid flags`, async () => {
    console.time("Sent invalid messages");
    for (let i = 0; i < NUMBER_OF_USERS; i++) {
      let isSent = true;
      try {
        await Mina.transaction({ sender: users[1] }, () => {
          zkApp.sendMessage(invalidMessages[i]);
        });
        console.error(
          `Invalid message ${i} was sent`,
          invalidMessages[i].toJSON(),
          fieldToBoolean(invalidMessages[i])
        );
      } catch (e) {
        isSent = false;
      }
      await Memory.info(`Sent ${i + 1} invalid messages`);
      expect(isSent).toBe(false);
    }
    console.timeEnd("Sent invalid messages");
    await Memory.info(`Sent invalid messages`);
  });

  it(`should send first message from user`, async () => {
    console.time("Sent first message");
    const tx = await Mina.transaction({ sender: users[0] }, () => {
      zkApp.sendMessage(messages[0]);
    });
    await tx.prove();
    await tx.sign([usersPrivateKeys[0]]).send();
    console.timeEnd("Sent first message");
    await Memory.info(`Sent first message`);
  });

  it(`should send messages from users`, async () => {
    console.time("Sent messages");
    for (let i = 1; i < NUMBER_OF_USERS; i++) {
      const tx = await Mina.transaction({ sender: users[i] }, () => {
        zkApp.sendMessage(messages[i]);
      });
      await tx.prove();
      await tx.sign([usersPrivateKeys[i]]).send();
      await Memory.info(`Sent ${i + 1} messages`);
    }
    console.timeEnd("Sent messages");
    await Memory.info(`Sent messages`, true);
  });

  it(`should check events`, async () => {
    const events = await zkApp.fetchEvents();
    expect(events.length).toBe(NUMBER_OF_USERS * 2);
    const messageEvents = events.filter((event) => event.type === "message");
    expect(messageEvents.length).toBe(NUMBER_OF_USERS);
    const addEvents = events.filter((event) => event.type === "add");
    expect(addEvents.length).toBe(NUMBER_OF_USERS);
    for (let i = 0; i < NUMBER_OF_USERS; i++) {
      const message: MessageEvent = messageEvents[i].event
        .data as unknown as MessageEvent;
      expect(messageEvents[i].type).toBe("message");
      expect(message.sender.toBase58()).toBe(users[i].toBase58());
      expect(message.message.toJSON()).toBe(messages[i].toJSON());
    }
    await Memory.info(`should check events`, true);
  });

  it(`should not send message second time`, async () => {
    let sent = true;
    try {
      await Mina.transaction({ sender: users[0] }, () => {
        zkApp.sendMessage(messages[0]);
      });
    } catch (e) {
      sent = false;
    }
    expect(sent).toBe(false);
    await Memory.info(`should not send message second time`);
  });

  it(`should not send message from extra user`, async () => {
    let sent = true;
    try {
      await Mina.transaction({ sender: extraUser }, () => {
        zkApp.sendMessage(messages[0]);
      });
    } catch (e) {
      sent = false;
    }
    expect(sent).toBe(false);
    await Memory.info(`should not send message from extra user`);
  });

  it(`should check the counter`, async () => {
    const counter = zkApp.counter.get();
    expect(Number(counter.toBigint())).toBe(NUMBER_OF_USERS);
    await Memory.info(`should check the counter`);
  });
});

function fieldToBoolean(message: Field): boolean[] {
  const mask = BigInt(0x3f);
  const flags = message.toBigInt() & mask;
  const bitsStr = flags.toString(2).padStart(6, "0") + "0";
  let reverseString = "";
  for (const char of bitsStr) reverseString = char + reverseString;
  const bits: boolean[] = reverseString.split("").map((bit) => bit === "1");
  return bits;
}

function isMessageValid(message: Field): boolean {
  const bits = fieldToBoolean(message);
  let isValid = true;
  if (bits[1] === true) {
    if (
      bits[2] === true ||
      bits[3] === true ||
      bits[4] === true ||
      bits[5] === true ||
      bits[6] === true
    ) {
      isValid = false;
    }
  }
  if (bits[2] === true) {
    if (bits[3] !== true) {
      isValid = false;
    }
  }
  if (bits[4] === true) {
    if (bits[5] !== false || bits[6] !== false) {
      isValid = false;
    }
  }
  return isValid;
}

class Memory {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  static rss: number = 0;
  constructor() {
    Memory.rss = 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  public static async info(description = ``, fullInfo = false) {
    const memoryData = process.memoryUsage();
    const formatMemoryUsage = (data: number) =>
      `${Math.round(data / 1024 / 1024)} MB`;
    const oldRSS = Memory.rss;
    Memory.rss = Math.round(memoryData.rss / 1024 / 1024);

    const memoryUsage = fullInfo
      ? {
          step: `${description}:`,
          rssDelta: `${(oldRSS === 0
            ? 0
            : Memory.rss - oldRSS
          ).toString()} MB -> Resident Set Size memory change`,
          rss: `${formatMemoryUsage(
            memoryData.rss
          )} -> Resident Set Size - total memory allocated`,
          heapTotal: `${formatMemoryUsage(
            memoryData.heapTotal
          )} -> total size of the allocated heap`,
          heapUsed: `${formatMemoryUsage(
            memoryData.heapUsed
          )} -> actual memory used during the execution`,
          external: `${formatMemoryUsage(
            memoryData.external
          )} -> V8 external memory`,
        }
      : `RSS memory: ${description}: ${formatMemoryUsage(memoryData.rss)}${
          oldRSS === 0
            ? ``
            : `, changed by ` + (Memory.rss - oldRSS).toString() + ` MB`
        }`;

    if (DEBUG) console.log(memoryUsage);
    await sleep(100);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
