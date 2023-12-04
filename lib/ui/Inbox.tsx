import { CSSProperties, ReactNode } from "react";
import type Talk from "talkjs";
import { useSession } from "../SessionContext";
import {
  getKeyForObject,
  splitObjectByPrefix,
  validateChildrenAreHtmlPanels,
} from "../util";
import { useSetter, useConversation, useUIBox } from "../hooks";
import { FirstParameter, UIBoxProps } from "../types";
import { MountedBox } from "../MountedBox";

type InboxProps = Partial<UIBoxProps<Talk.Inbox>> &
  Omit<Talk.InboxOptions, "selected"> & {
    highlightedWords?: FirstParameter<Talk.Inbox["setHighlightedWords"]>;
    inboxRef?: React.MutableRefObject<Talk.Inbox | undefined>;
    loadingComponent?: ReactNode;
    style?: CSSProperties;
    className?: string;
    children?: React.ReactNode;
  };

export function Inbox(props: InboxProps) {
  const session = useSession();

  if (!validateChildrenAreHtmlPanels(props.children)) {
    throw new Error(
      "<Inbox> may only have <HtmlPanel> components as direct children.",
    );
  }

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
    inboxRef,
    style,
    className,
    loadingComponent,
    children,
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
  useSetter(box, messageFilter, "setMessageFilter");
  useSetter(box, feedFilter, "setFeedFilter");
  useSetter(box, presence, "setPresence");
  useSetter(box, highlightedWords, "setHighlightedWords");
  useConversation(session, box, syncConversation, conversationId);

  return (
    <MountedBox
      box={box}
      session={session}
      className={className}
      style={style}
      loadingComponent={loadingComponent}
      handlers={events}
      children={children}
    />
  );
}
