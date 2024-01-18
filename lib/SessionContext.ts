import { createContext, useContext, useEffect, useState } from "react";
import type Talk from "talkjs";

export const SessionContext = createContext<Talk.Session | undefined>(
  undefined,
);

/**
 * Returns the currently active TalkJS Session.
 *
 * @remarks
 * Can only be used in child components of <Session>. This hook lets you
 * directly access the TalkJS
 * {@link https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/ | Session}
 * object.
 *
 * @returns The currently active session, or undefined if there is no current
 * session (either because it's still loading, or because it has been destroyed)
 *
 * Note: If you use the returned session asynchonously (eg inside a useEffect),
 * you must check its
 * {@link https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Session__isAlive | isAlive}
 * property just before using it. Trying to use a session that is no longer
 * alive will throw an error.
 *
 * During development in particular, sessions can be destroyed and recreated a
 * lot, eg due to React.StrictMode or due to hot-module reloading. Your effect
 * may run after a session has been destroyed but before it has been recreated.
 */
export function useSession() {
  const session = useContext(SessionContext);
  return session?.isAlive ? session : undefined;
}

/**
 * Returns conversations with unread messages.
 * 
 * @remarks
 * Can only be used in child components of <Session>.
 * 
 * @returns A list of {@link https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#UnreadConversation | UnreadConversation} objects,
 * or undefined if this hook is used outside of the <Session> component, or the session is not alive for any other reason.
 * During development in particular, sessions can be destroyed and recreated a
 * lot, eg due to React.StrictMode or due to hot-module reloading.
 */
export function useUnreads() {
  const session = useSession();
  const [unreads, setUnreads] = useState<Talk.UnreadConversation[] | undefined>();

  useEffect(() => {
    if (!session || !session.isAlive) {
      setUnreads(undefined);
      return;
    }

    const sub = session.unreads.onChange( unreads => {
      setUnreads(unreads);
    });

    return () => sub.unsubscribe();
  }, [session]);

  return unreads;
}
