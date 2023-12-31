import Talk from "talkjs";
import { useSession } from "../SessionContext";
import { getKeyForObject, splitObjectByPrefix } from "../util";
import { useSetter, useConversation, useUIBox, useMountBox } from "../hooks";
import { EventListeners } from "../EventListeners";
import { UIBoxProps } from "../types";

type PopupProps = UIBoxProps<Talk.Popup> &
  Talk.PopupOptions & {
    highlightedWords?: Parameters<Talk.Popup["setHighlightedWords"]>[0];
    popupRef?: React.MutableRefObject<Talk.Popup | undefined>;
  };

export function Popup(props: PopupProps) {
  const session = useSession();

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

  return <EventListeners target={box} handlers={events} />;
}
