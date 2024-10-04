import { useEffect, ReactNode, useState } from "react";
import Talk from "talkjs";
import { SessionContext } from "./SessionContext";
import { SessionEvents } from "./types";
import { EventListeners } from "./EventListeners";
import { useMethod } from "./hooks";

type UserProps =
  | { userId: string; syncUser?: undefined }
  | { userId?: undefined; syncUser: Talk.User | (() => Talk.User) };

type SessionProps = UserProps &
  SessionEvents &
  Pick<Talk.Session, "appId"> & {
    sessionRef?: React.MutableRefObject<Talk.Session | undefined>;
    desktopNotificationEnabled?: boolean;
    children?: ReactNode;
    token?: string;
    tokenFetcher?: () => Promise<string>;
    signature?: string;
  };

export function Session(props: SessionProps) {
  const [ready, markReady] = useState(false);
  const [session, setSession] = useState<Talk.Session>();

  const {
    userId,
    syncUser,
    appId,
    token,
    tokenFetcher,
    signature,
    sessionRef,
    desktopNotificationEnabled,
  } = props;

  useEffect(() => {
    Talk.ready.then(() => markReady(true));
  }, []);

  const me = ready
    ? typeof syncUser === "function"
      ? syncUser()
      : syncUser ?? new Talk.User(userId)
    : null;

  useEffect(() => {
    if (me) {
      const session = new Talk.Session({
        appId,
        me,
        token,
        tokenFetcher,
        signature,
      });
      setSession(session);
      if (sessionRef) {
        sessionRef.current = session;
      }

      return () => {
        // if appId or me changed, destroy (and then recreate) the entire
        // session.
        //
        // once the JSSDK supports proper programmatic user mutation, we can
        // avoid recreating the session when `syncUser` changes.
        session.destroy();
        setSession(undefined);
        if (sessionRef) {
          sessionRef.current = undefined;
        }
      };
    }
    // We intentionally add `me?.id` to the dependency array here instead of
    // just `me`, because `me` is an object so a shallow comparison will always
    // return `false`.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    signature,
    appId,
    userId,
    me?.id,
    token,
    tokenFetcher,
    sessionRef,
  ]);

  useMethod(
    session,
    desktopNotificationEnabled,
    "setDesktopNotificationEnabled",
  );

  return (
    <>
      <SessionContext.Provider value={session}>
        {props.children}
      </SessionContext.Provider>
      <EventListeners target={session} handlers={props} />
    </>
  );
}
