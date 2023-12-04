import Talk from "talkjs";
import { useSession } from "../SessionContext";
import {
  getKeyForObject,
  splitObjectByPrefix,
  validateChildrenAreHtmlPanels,
} from "../util";
import { useSetter, useConversation, useUIBox, useMountBox } from "../hooks";
import { EventListeners } from "../EventListeners";
import { UIBoxProps } from "../types";
import { BoxContext } from "../MountedBox";

type PopupProps = UIBoxProps<Talk.Popup> &
  Talk.PopupOptions & {
    highlightedWords?: Parameters<Talk.Popup["setHighlightedWords"]>[0];
    popupRef?: React.MutableRefObject<Talk.Popup | undefined>;
    children?: React.ReactNode;
  };

export function Popup(props: PopupProps) {
  const session = useSession();

  if (!validateChildrenAreHtmlPanels(props.children)) {
    throw new Error(
      "<Popup> may only have <HtmlPanel> components as direct children.",
    );
  }

  if (session) {
    const key = getKeyForObject(session);
    return <ActivePopup key={key} session={session} {...props} />;
  }
  return null;
}

function ActivePopup(props: PopupProps & { session: Talk.Session }) {
  const {
    session,
    conversationId,
    syncConversation,
    popupRef,
    children,
    ...optionsAndEvents
  } = props;

  const [events, options] = splitObjectByPrefix(optionsAndEvents, "on");
  const { messageFilter, presence, highlightedWords, ...simpleOptions } =
    options;

  const box = useUIBox(session, "createPopup", simpleOptions, popupRef);
  useSetter(box, messageFilter, "setMessageFilter");
  useSetter(box, presence, "setPresence");
  useSetter(box, highlightedWords, "setHighlightedWords");
  useConversation(session, box, syncConversation, conversationId);
  useMountBox(box, undefined);

  return (
    <BoxContext.Provider value={box}>
      {children}
      <EventListeners target={box} handlers={events} />
    </BoxContext.Provider>
  );
}
