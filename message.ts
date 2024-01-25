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

export const MAX_USERS = 100;

export class MessageEvent extends Struct({
  sender: PublicKey,
  message: Field,
}) {}

export class Message extends SmartContract {
  @state(PublicKey) admin = State<PublicKey>();

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proof(),
    });
  }

  reducer = Reducer({
    actionType: PublicKey,
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

    const { state: count } = this.reducer.reduce(
      pendingActions,
      UInt32,
      (state, action) => {
        return state.add(UInt32.from(1));
      },
      {
        state: UInt32.from(1),
        actionState: Reducer.initialActionState,
      },
      { maxTransactionsWithActions: MAX_USERS }
    );

    count.assertLessThanOrEqual(UInt32.from(MAX_USERS));

    this.reducer.dispatch(address);
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
        const isTheSame = this.sender.equals(action);
        return isTheSame.or(state);
      },
      {
        state: Bool(false),
        actionState: Reducer.initialActionState,
      },
      { maxTransactionsWithActions: MAX_USERS }
    );
    isAddressValid.assertEquals(Bool(true));
    this.emitEvent(
      "message",
      new MessageEvent({ sender: this.sender, message })
    );
  }
}
