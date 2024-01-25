import {
  Field,
  Struct,
  method,
  SmartContract,
  Reducer,
  PublicKey,
  Bool,
  state,
  State,
  DeployArgs,
  Permissions,
  UInt32,
} from "o1js";

export const MAX_USERS = 2;

export class MessageEvent extends Struct({
  sender: PublicKey,
  message: Field,
}) {}

export class MessageAction extends Struct({
  address: PublicKey,
  isMessage: Bool,
  message: Field,
}) {}

export class Message extends SmartContract {
  @state(PublicKey) admin = State<PublicKey>();
  @state(UInt32) counter = State<UInt32>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proof(),
    });
  }

  reducer = Reducer({
    actionType: MessageAction,
  });

  events = {
    add: PublicKey,
    message: MessageEvent,
  };

  @method add(address: PublicKey) {
    const admin = this.admin.getAndRequireEquals();
    this.sender.assertEquals(admin);
    const pendingActions = this.reducer.getActions({
      fromActionState: Reducer.initialActionState,
    });

    const { state: isAlreadyAdded } = this.reducer.reduce(
      pendingActions,
      Bool,
      (state, action) => {
        const isAdded = address.equals(action.address);
        return isAdded.or(state);
      },
      {
        state: Bool(false),
        actionState: Reducer.initialActionState,
      },
      { maxTransactionsWithActions: MAX_USERS * 2 }
    );

    isAlreadyAdded.assertEquals(Bool(false));

    const { state: count } = this.reducer.reduce(
      pendingActions,
      UInt32,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (state, action) => {
        return state.add(UInt32.from(1));
      },
      {
        state: UInt32.from(1),
        actionState: Reducer.initialActionState,
      },
      { maxTransactionsWithActions: MAX_USERS * 2 }
    );

    count.assertLessThanOrEqual(UInt32.from(MAX_USERS));

    this.reducer.dispatch(
      new MessageAction({ address, isMessage: Bool(false), message: Field(0) })
    );
    this.emitEvent("add", address);
  }

  @method sendMessage(message: Field) {
    const pendingActions = this.reducer.getActions({
      fromActionState: Reducer.initialActionState,
    });

    const { state: isAddressValid } = this.reducer.reduce(
      pendingActions,
      Bool,
      (state, action) => {
        const isTheSame = this.sender.equals(action.address);
        return isTheSame.or(state);
      },
      {
        state: Bool(false),
        actionState: Reducer.initialActionState,
      },
      { maxTransactionsWithActions: MAX_USERS * 2 }
    );
    isAddressValid.assertEquals(Bool(true));

    const { state: isAlreadySent } = this.reducer.reduce(
      pendingActions,
      Bool,
      (state, action) => {
        const isAddress = this.sender.equals(action.address);
        const isMessage = action.isMessage;
        const isSent = isAddress.and(isMessage);
        return isSent.or(state);
      },
      {
        state: Bool(false),
        actionState: Reducer.initialActionState,
      },
      { maxTransactionsWithActions: MAX_USERS * 2 }
    );

    isAlreadySent.assertEquals(Bool(false));
    this.reducer.dispatch(
      new MessageAction({
        address: this.sender,
        isMessage: Bool(true),
        message,
      })
    );

    const counter = this.counter.getAndRequireEquals();
    this.counter.set(counter.add(UInt32.from(1)));
    this.emitEvent(
      "message",
      new MessageEvent({ sender: this.sender, message })
    );
  }
}
