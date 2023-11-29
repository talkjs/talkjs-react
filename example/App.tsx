import "./App.css";

import { Session, Chatbox, HtmlPanel } from "../lib/main";
import Talk from "talkjs";
import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";

const convIds = ["talk-react-94872948u429843", "talk-react-194872948u429843"];
const users = [
  {
    id: "talkjs-react-user-1",
    name: "Pete",
    role: "default",
  },
  {
    id: "talkjs-react-user-2",
    name: "Jack",
    role: "default",
  },
];

function App() {
  const onBlur = useCallback(() => console.log("blur"), []);
  const onFocus = useCallback(() => console.log("focus"), []);

  const [convId, setConvId] = useState(convIds[0]);

  const [me, setMe] = useState<Talk.UserOptions>(users[0]);

  const otherMe = useCallback(() => {
    const index = (users.findIndex((u) => u.id === me.id) + 1) % users.length;
    setMe(users[index]);
  }, [me]);

  const [blur, setBlur] = useState<boolean>(false);
  const addBlur = useCallback(() => {
    setBlur(true);
  }, []);

  const onAction = useCallback((event: Talk.MessageActionEvent) => {
    console.log(event.action);
  }, []);

  const onPerm = useCallback(() => {
    alert("permission request coming up!");
  }, []);

  const onUnreads = useCallback((convs: Talk.UnreadConversation[]) => {
    console.log("unreads:", convs);
  }, []);

  const switchConv = useCallback(() => {
    const nextConv = (convIds.indexOf(convId) + 1) % convIds.length;
    setConvId(convIds[nextConv]);
  }, [convId]);

  const createUser = useCallback(() => {
    console.log("createUser");
    return new Talk.User(me);
  }, [me]);

  const createConv = useCallback(
    (session: Talk.Session) => {
      console.log("createConv");
      const conv = session.getOrCreateConversation(convId);
      conv.setParticipant(session.me);
      return conv;
    },
    [convId],
  );

  const onSendMessage = useCallback((event: Talk.SendMessageEvent) => {
    const text = event.message.text;
    if (text) {
      event.override({ custom: { prefix: text.substring(0, 2) } });
    }
  }, []);

  // setters become props, eg `setMessageFilter` becomes a `messageFilter` prop:
  const [prefix, setPrefix] = useState("");
  const setFilter = useCallback(() => {
    const prefix = prompt(
      "What 2-character prefix to filter by? (keep empty to disable)",
    );
    setPrefix(prefix ?? "");
  }, []);
  const filter = useMemo<Talk.MessagePredicate>(
    () => (prefix ? { custom: { prefix: ["==", prefix] } } : {}),
    [prefix],
  );

  // use refs to get access to the underlying TalkJS objects
  const chatboxRef = useRef<Talk.Chatbox>();
  const sessionRef = useRef<Talk.Session>();

  const sendMessages = useCallback(() => {
    const conv = sessionRef.current?.getOrCreateConversation(convId);
    conv?.sendMessage("I'm located here:");
    chatboxRef.current?.sendLocation();
  }, [convId]);

  // session.setDesktopNotificationEnabled becomes a prop, `desktopNotificationEnabled`
  const [dn, setDn] = useState<boolean | undefined>(undefined);
  const toggleDn = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDn(JSON.parse(event.target!.value));
  }, []);

  const [panelHeight, setPanelHeight] = useState(100);
  const [panelVisible, setPanelVisible] = useState(true);

  const [panel, setPanel] = useState(false);

  if (typeof import.meta.env.VITE_APP_ID !== "string") {
    return (
      <div style={{ maxWidth: "50em" }}>
        <p>
          Missing <code>VITE_APP_ID</code> environment variable. Please create
          an <code>.env.local</code> file in the project root and define your
          App ID there like so:
        </p>
        <pre
          style={{
            backgroundColor: "#eee",
            display: "inline-block",
            padding: "2em",
          }}
        >
          <code>VITE_APP_ID=my_app_id_here</code>
        </pre>
      </div>
    );
  }

  return (
    <>
      <Session
        appId={import.meta.env.VITE_APP_ID}
        syncUser={createUser}
        onBrowserPermissionNeeded={onPerm}
        onUnreadsChange={onUnreads}
        sessionRef={sessionRef}
        desktopNotificationEnabled={!!dn}
      >
        Chatting as {me.name} in conversation {convId}
        <br />
        <Chatbox
          //conversationId={"talk-react-94872948u429843"}
          messageField={{ placeholder: "Write a message.." }}
          chatboxRef={chatboxRef}
          syncConversation={createConv}
          onFocus={onFocus}
          onCustomMessageAction={onAction}
          showChatHeader={false}
          onSendMessage={onSendMessage}
          messageFilter={filter}
          loadingComponent={<span>LOADING....</span>}
          {...(blur ? { onBlur } : {})}
          style={{ width: 500, height: 600 }}
        >
          {panel && (
            <HtmlPanel
              url="example/panel.html"
              height={panelHeight}
              show={panelVisible}
            >
              I am an HTML panel.
              <button
                onClick={() => setPanelHeight(panelHeight > 100 ? 100 : 150)}
              >
                Toggle panel height
              </button>
              <button onClick={() => setPanelVisible(false)}>Hide panel</button>
            </HtmlPanel>
          )}
        </Chatbox>
      </Session>

      <button onClick={() => setPanel((x) => !x)}>
        toggle panel to {String(!panel)}
      </button>
      <button onClick={otherMe}>switch user (new session)</button>
      <br />
      <button onClick={switchConv}>
        switch conv (without reloading the chatbox)
      </button>
      <br />
      <button onClick={addBlur}>
        add onBlur handler (variable event props)
      </button>
      <br />
      <button onClick={setFilter}>
        set message filter (without reloading the chatbox)
      </button>
      <br />
      <button onClick={sendMessages}>send messages via SDK</button>
      <br />
      <fieldset>
        <legend>Desktop Notifications</legend>
        <label>
          <input
            type="radio"
            name="desktopNotificationEnabled"
            checked={dn}
            value="true"
            onChange={toggleDn}
          />
          On
        </label>
        <label>
          <input
            type="radio"
            name="desktopNotificationEnabled"
            checked={!dn}
            value="false"
            onChange={toggleDn}
          />
          Off
        </label>
      </fieldset>
    </>
  );
}

export default App;
