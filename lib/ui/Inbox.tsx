import { CSSProperties, ReactNode } from "react";
import type Talk from "talkjs";
import { useSession } from "../SessionContext";
import { getKeyForObject, splitObjectByPrefix } from "../util";
import { useMethod, useConversation, useUIBox } from "../hooks";
import { FirstParameter, UIBoxProps } from "../types";
import { MountedBox } from "../MountedBox";

type InboxProps = Partial<UIBoxProps<Talk.Inbox>> &
  Omit<Talk.InboxOptions, "selected"> & {
    highlightedWords?: FirstParameter<Talk.Inbox["setHighlightedWords"]>;
    inboxRef?: React.MutableRefObject<Talk.Inbox | undefined>;
    loadingComponent?: ReactNode;
    style?: CSSProperties;
    className?: string;
  };

export function Inbox(props: InboxProps) {
  const session = useSession();

  if (session) {
    const key = getKeyForObject(session);
    return <ActiveInbox key={key} session={session} {...props} />;
  } else {
    return (
      <div style={props.style} className={props.className}>
        {props.loadingComponent}
      </div>
    );
  }
}

function ActiveInbox(props: InboxProps & { session: Talk.Session }) {
  const {
    session,
    conversationId,
    syncConversation,
    asGuest,
    inboxRef,
    style,
    className,
    loadingComponent,
    ...optionsAndEvents
  } = props;

  const [events, options] = splitObjectByPrefix(optionsAndEvents, "on");
  const {
    messageFilter,
    feedFilter,
    presence,
    highlightedWords,
    ...simpleOptions
  } = options;

  const box = useUIBox(session, "createInbox", simpleOptions, inboxRef);
  useMethod(box, messageFilter, "setMessageFilter");
  useMethod(box, feedFilter, "setFeedFilter");
  useMethod(box, presence, "setPresence");
  useMethod(box, highlightedWords, "setHighlightedWords");
  useConversation(session, box, syncConversation, conversationId, asGuest);

  return (
    <MountedBox
      box={box}
      session={session}
      className={className}
      style={style}
      loadingComponent={loadingComponent}
      handlers={events}
    />
  );
}
