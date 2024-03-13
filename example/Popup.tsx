import { useCallback, useState } from "react";
import { Session, Popup } from "../lib/main";
import Talk from "talkjs";

export default function PopupExample() {
    const [show, setShow] = useState<boolean>(false)
    return <Session
        appId={import.meta.env.VITE_APP_ID}
        syncUser={useCallback(() => new Talk.User({
            id: "123",
            name: "John",
        }), [])}
    >
        <h1>Popup test</h1>
        <p>
            <label>show:
                <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
            </label>
        </p>
        <Popup syncConversation={useCallback((s) => {
            const c = s.getOrCreateConversation("popuptest");
            c.setParticipant(s.me);
            return c;
        }, [])} show={show}></Popup>
    </Session>
}