import Talk from "talkjs";
import { useSession } from "../SessionContext";
import {
  getKeyForObject,
  splitObjectByPrefix,
  validateChildrenAreHtmlPanels,
} from "../util";
import { useMethod, useConversation, useUIBox, useMountBox } from "../hooks";
import { EventListeners } from "../EventListeners";
import { UIBoxProps } from "../types";
import { BoxContext } from "../MountedBox";
import { useEffect } from "react";

type PopupProps = UIBoxProps<Talk.Popup> &
  Talk.PopupOptions & {
    highlightedWords?: Parameters<Talk.Popup["setHighlightedWords"]>[0];
    popupRef?: React.MutableRefObject<Talk.Popup | undefined>;
    show?: boolean;
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
    asGuest,
    show,
    popupRef,
    children,
    ...optionsAndEvents
  } = props;

  const [events, options] = splitObjectByPrefix(optionsAndEvents, "on");
  const { messageFilter, presence, highlightedWords, ...simpleOptions } =
    options;

  const box = useUIBox(session, "createPopup", simpleOptions, popupRef);
  useMethod(box, messageFilter, "setMessageFilter");
  useMethod(box, presence, "setPresence");
  useMethod(box, highlightedWords, "setHighlightedWords");
  useConversation(session, box, syncConversation, conversationId, asGuest);
  const mounted = useMountBox(box, {show: show ?? true});

  useEffect(() => {
    if(show === undefined || !mounted) {
      return;
    }

    if(show) {
      box?.show();
    } else {
      box?.hide();
    }

  }, [show, mounted, box])

  return (
    <BoxContext.Provider value={box}>
      {children}
      <EventListeners target={box} handlers={events} />
    </BoxContext.Provider>
  );
}
