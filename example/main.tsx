import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// import Talk from "talkjs";

// await Talk.ready;

// const me = new Talk.User({ id: "alice", name: "Alice" });
// const session = new Talk.Session({ appId: "Hku1c4Pt", me });
// const chatbox = session.createChatbox();
// const conversation = session.getOrCreateConversation("abc");
// conversation.setParticipant(me);

// chatbox.select(conversation);
// chatbox.mount(document.getElementById("root")!);

// chatbox.createHtmlPanel({ url: "./example/panel.html" });

// document.getElementById("root")!.style.height = "100vh";