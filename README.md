# React components for TalkJS

This library makes it easy to use the [TalkJS](https://talkjs.com) pre-built chat UIs inside a React web application.

`@talkjs/react` encapsulates `talkjs`, the framework-independent ("vanilla") [TalkJS JavaScript SDK](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK). It only provides React components for UI-related matters: For anything related to data manipulation, such as synchronizing user data, or creating and joining conversations, use the vanilla SDK.

TypeScript bindings are included.

If you encounter any problems with `@talkjs/react`, please open an issue. If you have a problem with TalkJS itself, or if you're not sure where the problem lies, it's better to open a chat with our support on https://talkjs.com/ (just open the chat widget). TalkJS support is staffed by engineers.

## Getting Started

Install both `@talkjs/react` and the vanilla [TalkJS NPM package](https://www.npmjs.com/package/talkjs):

```sh
npm install talkjs @talkjs/react
# or
yarn add talkjs @talkjs/react
```

`@talkjs/react` is just a thin wrapper around `talkjs`. Notably, it is designed such that when you update to a new version of `talkjs` that exposes new options, methods or events, you can use these right away from the React components, without having to update `@talkjs/react` (or wait for such an update to be published)

## Load a UI for existing chat data

### 1. Create a session

Wrap your main app components in a session:

```tsx
import { Session } from "@talkjs/react";

//...

<Session appId={/* your app ID, find it in the dashboard */} userId="pete">
  {/* your main app here here */}
</Session>;
```

This assumes user `pete` exists in TalkJS.

The session encapsulates a connection to the TalkJS realtime infrastructure, and this connection will live as long as the session component is mounted. If you want to listen for events or show desktop notifications for new messages, we recommend putting the session at the top of your component hierarchy, so it's active even when no chat UI is being shown.

### 2. Create a chatbox

Anywhere inside the children of `<Session>` you can create a `<Chatbox>`, an `<Inbox>` or a `<Popup>`:

```tsx
import { Chatbox } from "@talkjs/react";

//...

<Chatbox
  conversation="welcome"
  style={{ width: 400, height: 600 }}
  className="chat-container"
/>;
```

This assumes conversation `welcome` exists in TalkJS, with `pete` as a participant.

The code above will render a `div` with the `style` and `className` passed through, and put a TalkJS Chatbox inside it. If you change the value of the `conversation` prop, the chatbox will switch to another conversation.

## Manipulating data

If your security settings allow, TalkJS lets you create users and join conversations from the client side. This lets you synchronize user data with TalkJS in a just-in-time fashion.

You manipulate data exactly as you would if you directly used the [vanilla JavaScript SDK](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK).

### 1. Synchronize user data

To create or update user data, just replace the `userId` prop by `syncUser`. This prop expects a callback that uses the vanilla TalkJS SDK to create a `Talk.User` object:

```tsx
import { useCallback } from "react";
import { Session } from "@talkjs/react";
import Talk from "talkjs";

//...

const syncUser = useCallback(
  () =>
    // regular vanilla TalkJS code here
    new Talk.User({
      id: "pete",
      name: "Pete",
      photoUrl: "https://example.com/pete.jpg",
      //...
    }),
  []
);

<Session
  appId={/* your app ID, find it in the dashboard */}
  syncUser={syncUser}
>
  {/* your main app here here */}
</Session>;
```

Note: you can't create `Talk.User` object before the TalkJS SDK has initialized. In vanilla JS you'd have to await `Talk.ready` promise for this, but `@talkjs/react` ensures that your `syncUser` callback is only called after TalkJS is ready.

### 2. Create and join a conversation

Similarly, `<Chatbox>`, `<Inbox>` and `<Popup>` let you lazily create or update conversations with the `syncConversation` prop.

Just replace the `conversation` prop by a `syncConversation` callback, which will be invoked just before the chatbox is created. Then, use the provided [`session`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session) object to create a [`ConversationBuilder`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/ConversationBuilder/#ConversationBuilder) using [`getOrCreateConversation`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Session__getOrCreateConversation):

```tsx
import { useCallback } from "react";
import { Chatbox } from "@talkjs/react";
import Talk from "talkjs";

//...

const syncConversation = useCallback((session: Talk.Session) => {
  // regular vanilla TalkJS code here
  const conversation = session.getOrCreateConversation("welcome");
  conversation.setParticipant(session.me);
  return conversation;
}, []);

<Chatbox
  syncConversation={syncConversation}
  style={{ width: 400, height: 600 }}
  className="chat-container"
/>;
```

## Events

All events supported by the [TalkJS JavaScript SDK](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK) are exposed on the React components as props. For example:

```tsx
<Session
  appId={/*...*/}
  userId={/*...*/}
  onMessage={message => console.log(message.body)}
  onUnreadsChange={unreads => console.log(unreads.length)}
>
```

All events supported by `<Session>` are listed in [the `Talk.Session` reference](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Session__methods): Any method that starts with `on` is exposed as an event prop in React.

Note that [`Session.unreads.onChange`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Unreads__onChange) is exposed directly on the `<Session>` as a prop named `onUnreadsChange`.

Similarly, for `<Chatbox>` ([vanilla sdk](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Chatbox/#Chatbox__methods)), `<Inbox>` ([vanilla sdk](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Chatbox/#Chatbox__methods)) or `<Popup>` ([vanilla sdk](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Chatbox/#Chatbox__methods)):

```tsx
<Chatbox
  conversationId={/*...*/}
  onSendMessage={(event) => console.log(event.message.text)}
  onCustomMessageAction={(event) => console.log(event.action)}
  onSomethingSomething={/* callback */}
/>
```

Again, any method that starts with `on` is exposed as a prop.

## Options

TalkJS supports a lot of options that let you finetune the behavior of the chat UI. Any option that can be passed to [`createChatbox`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Session__createChatbox), [`createInbox`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Session__createInbox) and [`createPopup`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Session__createPopup) can be passed as a prop:

```tsx
<Inbox
  // only show conversations where `custom.state != 'hidden'`
  feedFilter={{ custom: { state: ["!=", "hidden"] } }}
  showMobileBackButton={false}
  messageField={{ placeholder: "Write a message.." }}
  //...
/>
```

If any of these props change, `<Inbox>` will apply it directly through a setter such as [`setFeedFilter`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Inbox/#Inbox__setFeedFilter). If no such setter exists, it will recreate the `Talk.Inbox`.

## Loading

TalkJS loads quickly but not always instantaneously. If you want to display something while TalkJS is loading, pass a react node to the `loadingComponent` prop:

```tsx
<Inbox
  //...
  loadingComponent={<h1>Loading..</h1>}
/>
```

## Direct access to TalkJS internals

If you need to do things with your
`Talk.Session`, `Talk.Chatbox`, `Talk.Inbox` or `Talk.Popup` instances that the react bindings to not let you do, you can get a direct reference to it.

### Using hooks

In any child component of `<Session>` you can call the `useSession` hook to get the `Talk.Session` object:

```tsx
import { useSession } from "@talkjs/react";

function MyComponent(props) {
  const session = useSession(); // Talk.Session | undefined

  useEffect(() => {
    if (session?.isAlive) {
      session.getOrCreateConversation("welcome").sendMessage("hi");
    }
  }, []);
}
```

Note that the value may be undefined if the session has not yet loaded or has
since been destroyed. See the section on liveness below.

### Using refs


All `@talkjs/react` components let you assign the underlying TalkJS object to a
ref:

```tsx
const session = useRef<Talk.Session>();
const chatbox = useRef<Talk.Chatbox>();

//...

onSomeEvent = useCallback(async () => {
  // do something with the chatbox
  if (chatbox.current?.isAlive) {
    chatbox.current.sendLocation();
  }
  // do something with the session.
  if (session.current?.isAlive) {
    const inboxes = await session.current.getInboxes();
  }
}, []);

<Session /*...*/ sessionRef={session}>
  <Chatbox /*...*/ chatboxRef={chatbox} />
</Session>;
```

The ref will be set once the Talk.Chatbox object has been created (resp. when the Talk.Session has initialized), and it will be set back to `undefined` once it has been destroyed.

### Liveness

Make sure you always check the `isAlive` property to ensure that the object is
not destroyed because React is prone to trigger race conditions here (especially
when React.StrictMode is enabled or when using a development setup with Hot
Module Reloading, both of which cause a lot of destroying).

## Reference

### `<Session>`

Accepted props:

- `appId: string` - your app ID from the TalkJS dashboard
- `userId: string` - required unless `syncUser` is given
- `syncUser: Talk.User | () => Talk.User` - required unless `userId` is given
- `sessionRef: React.MutableRefObject<Talk.Session>` - See [above](#using-refs)

Accepted events (props that start with "on"):

- all events accepted by [`Talk.Session`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Session__methods)
- `onUnreadsChange` - as in [`Unreads.onChange`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#Unreads__onChange)

### `<Chatbox>`, `<Inbox>` and `<Popup>`

Accepted props:

- `conversationId: string` - Selects this conversation. If the conversation does not exist, the "Not found" screen is shown.
- `syncConversation: Talk.ConversationBuilder | () => Talk.ConversationBuilder` - Creates or updates the given conversation using the supplied ConversationBuilder, then selects it. 
- `style: CSSProperties` - Optional. Passed through to the `div` that will contain the chatbox
- `className: string` - Optional. Passed through to the `div` that will contain the chatbox
- `loadingComponent: ReactNode` - Optional. A react node which will be shown while the chatbox is
  loading
- `chatboxRef` (resp. `inboxRef`, `popupRef`) - Pass a ref (created with `useRef`) and it'll be set to the vanilla JS [Chatbox](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Chatbox/) (resp. [Inbox](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Inbox/), [Popup](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Popup/)) instance. See [above](#using-refs) for an example.
- All [Talk.ChatboxOptions](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Session/#ChatboxOptions)

Accepted events (props that start with "on"):

- All events accepted by [`Talk.Chatbox`](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Chatbox/#Chatbox__methods) (resp. [Inbox](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Inbox/#Inbox__methods), [Popup](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Popup/#Popup__methods))

Note: For `<Chatbox>` and `<Popup>`, you must provide exactly one of `conversationId` and `syncConversation`. For `<Inbox>`, leaving both unset selects the latest conversation this user participates in (if any). See [Inbox.select](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK/Inbox/#Inbox__select) for more information.


## Contributing

This library is open-source and permissively licensed (MIT).

To contribute a PR, we require that you fill out a contributor license agreement (CLA) so that we (TalkJS) retain ownership over this repository. Pick the [Corporate CLA](corporate_contributor_license_agreement.md) or the [individual CLA](individual_contributor_license_agreement.md). Note that you do not need to sign anything to be able to fork this repository and make changes for your own use.

Should you want to contribute, please take note of the design notes below.

## Design notes

This library has been designed to be maximally forward-compatible with future TalkJS features. The `talkjs` package is a peer dependency, not a direct dependency, which means you can control which TalkJS version you want to be on. It also means you won't need to wait for a new version of `@talkjs/react` to be published before you can get access to new TalkJS features. 

From our (TalkJS) perspective, it means we have a lower maintenance burden: we can ship new JS features without having to update (and test and verify) `@talkjs/react`.

This works because vanilla TalkJS is fully backward compatible and has a very consistent design: all UI components are instantiated and mutated in the same way. The React components simply treats any prop that looks like an event (name starts with "on") like an event. Also, barring some props unique to the react components (such as `syncConversation`, `style` and `loadingComponent`), all remaining props are simply assumed to be valid options to pass to `createChatbox` and its sister methods.

This way, if TalkJS eg adds support for a new event or a new option, this will Just Work without updating `@talkjs/react`. Modern TypeScript features (notably, [template literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)) let us do this in a fully type-safe manner: If you upgrade `talkjs`, then your invocations to `@talkjs/react` components will allow new props.

Any future changes should follow this same design: they should be maximally forward compatible.
