import deepEqual from "fast-deep-equal";
import type Talk from "talkjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConversationProps, FirstParameter } from "./types";
import { Mountable } from "./util";

export type TalkObject = Talk.Session | Talk.UIBox;

/**
 * When `val` is deeply equal to its value the previous time this hook was
 * called, returns the previous version instead. This way, react's equality
 * checker can see it's unchanged.
 *
 * This allows users to pass object literals to this prop without causing
 * needless re-renders.
 */
export function usePreviousIfDeeplyEqual<T>(val: T) {
  const remembered = useRef<{ val: T }>();

  if (!remembered.current || !deepEqual(val, remembered.current.val)) {
    remembered.current = { val };
  }
  return remembered.current.val;
}

/**
 * Calls method `method` on `box` with `value`, iff `value` is set & deeply
 * different from before (and the box is alive)
 */
export function useMethod<
  V,
  S extends string,
  T extends TalkObject & Record<S, (val: V) => any>,
>(box: T | undefined, value: V | undefined, method: S) {
  value = usePreviousIfDeeplyEqual(value);
  useEffect(() => {
    if (value !== undefined && box?.isAlive) {
      box[method](value);
    }
  }, [method, box, value]);
}

/**
 * Like {@link useMethod}, except `args` is an array that gets spread into
 * the method call
 */
export function useSpreadMethod<
  V extends any[],
  S extends string,
  T extends TalkObject & Record<S, (...args: V) => any>,
>(box: T | undefined, args: V | undefined, method: S) {
  args = usePreviousIfDeeplyEqual(args);
  useEffect(() => {
    if (args !== undefined && box?.isAlive) {
      box[method](...args);
    }
  }, [method, box, args]);
}

/**
 * Calls `box.select` with either `syncConversation` or `conversationId`
 * depending on which is set. If neither is set, which is valid for the Inbox,
 * `select` is not called at all.
 */
export function useConversation<T extends Talk.UIBox>(
  session: Talk.Session,
  box: T | undefined,
  syncConversation: ConversationProps["syncConversation"],
  conversationId: ConversationProps["conversationId"],
  asGuest: boolean | undefined,
) {
  const conversation = useMemo(() => {
    if (typeof syncConversation === "function") {
      return session?.isAlive ? syncConversation(session) : undefined;
    }
    return syncConversation ?? conversationId;
  }, [session, syncConversation, conversationId]);

  const args = (
    conversation !== undefined ? [conversation, { asGuest }] : undefined
  ) as any;

  useSpreadMethod(box, args, "select");
}

// subset of Session to help TypeScript pick the right overloads
interface BoxFactory {
  createChatbox(options: Talk.ChatboxOptions): Talk.Chatbox;
  createInbox(options: Talk.InboxOptions): Talk.Inbox;
  createPopup(options: Talk.PopupOptions): Talk.Popup;
}
export function useUIBox<
  K extends keyof BoxFactory,
  O extends FirstParameter<BoxFactory[K]>,
  R extends ReturnType<BoxFactory[K]>,
>(
  session: undefined | (Talk.Session & { [f in K]: (options: O) => R }),
  create: K,
  options: O,
  ref?: React.MutableRefObject<R | undefined>,
) {
  const [box, setBox] = useState<R>();

  options = usePreviousIfDeeplyEqual(options);

  useEffect(() => {
    if (session?.isAlive) {
      const uibox = session[create](options) as R;
      setBox(uibox);
      if (ref) {
        ref.current = uibox;
      }

      return () => {
        uibox.destroy();
        setBox(undefined);
      };
    } else {
      setBox(undefined);
      if (ref) {
        ref.current = undefined;
      }
    }
    // ESLint can't tell that `ref` is a ref, so disable the rule here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, create, options]);
  return box;
}

/**
 * Calls box.mount (if box is alive & has changed), and tracks loading state.
 *
 * @returns whether the box has successfully been mounted: false if still
 * loading (ie mount has not yet been called or completed), and true otherwise
 */
export function useMountBox<T extends Talk.UIBox & Mountable>(
  box: T | undefined,
  ref: FirstParameter<T["mount"]>,
) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (box?.isAlive) {
      box.mount(ref).then(() => setMounted(true));
    }
    // ESLint can't tell that `ref` is a ref, so disable the rule here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  return mounted;
}
