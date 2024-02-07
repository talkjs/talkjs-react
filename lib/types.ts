import type Talk from "talkjs";
import { Func } from "./util";

export type FirstParameter<T extends Func> = Parameters<T>[0];

// All properties of T that start with "on", eg `"onBlur" | "onSendMessage" |
// ...`.
//
// Excludes `on` the action events, which have a 2-parameter overload and TS
// doesn't automagically pick the right one, so we special-case them below.
type EventNames<T extends Talk.UIBox | Talk.Session> = Exclude<
  Extract<keyof T, `on${string}`>,
  "on" | "onCustomConversationAction" | "onCustomMessageAction"
>;

// name->function map of simple events, eg `{ onBlur: () => void, onSendMessage:
// (event: SendMessageEvent) => void, ...}`
type Events<T extends Talk.UIBox | Talk.Session> = {
  [P in EventNames<T>]?: T[P] extends Func ? FirstParameter<T[P]> : never;
};

// all events that a <UIBox> can accept, including special cases
export type UIBoxEvents<T extends Talk.UIBox> = Events<T> & {
  onCustomMessageAction?: (event: Talk.MessageActionEvent) => void;
  onCustomConversationAction?: (event: Talk.ConversationActionEvent) => void;
};

// all events that a <Session> can accept, including special cases
export type SessionEvents = Events<Talk.Session> & {
  onUnreadsChange?: (messages: Talk.UnreadConversation[]) => void;
};

export type ConversationProps =
  | {
      conversationId: string;
      syncConversation?: undefined;
    }
  | {
      conversationId?: undefined;
      syncConversation:
        | Talk.ConversationBuilder
        | ((session: Talk.Session) => Talk.ConversationBuilder);
    };

export type UIBoxProps<T extends Talk.UIBox> = UIBoxEvents<T> &
  ConversationProps & { asGuest?: boolean };

declare const testChatboxEvents: UIBoxEvents<Talk.Chatbox>;
declare const testInboxEvents: UIBoxEvents<Talk.Inbox>;
declare const testSessionEvents: SessionEvents;
