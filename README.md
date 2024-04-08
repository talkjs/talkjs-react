# React components for TalkJS

The `@talkjs/react` library makes it easy to use [TalkJS](https://talkjs.com) inside a React web application by providing React components for our pre-built chat UIs.

`@talkjs/react` encapsulates `talkjs`, the framework-independent [TalkJS JavaScript SDK](https://talkjs.com/docs/Reference/JavaScript_Chat_SDK). For anything related to data manipulation, such as synchronizing user data, or creating and joining conversations, use the JavaScript SDK.

TypeScript bindings are included.

If you encounter any problems with `@talkjs/react`, please open an issue. If you have a problem with TalkJS itself, or if you're not sure where the problem lies, it's better to open a [chat for support](https://talkjs.com/?chat). TalkJS support is staffed by engineers.

## Prerequisites

- A [TalkJS account](https://talkjs.com/dashboard/login). TalkJS provides a ready-to-use chat client for your application. Your account gives you access to TalkJS's free development environment.
- A [React app](https://react.dev/learn/start-a-new-react-project) that you will add TalkJS to

## Documentation

- [Getting started guide](https://talkjs.com/docs/Getting_Started/Frameworks/React/)
- [React SDK reference docs](https://talkjs.com/docs/Reference/React_SDK/Installation/)
- [Team chat tutorial](https://talkjs.com/resources/how-to-use-talkjs-to-create-a-team-chat-with-channels/) and [example code](https://github.com/talkjs/talkjs-examples/tree/master/react/remote-work-demo)

## Examples

The following examples use the [`Session`](https://talkjs.com/docs/Reference/React_SDK/Components/Session/) and [`Chatbox`](https://talkjs.com/docs/Reference/React_SDK/Components/Chatbox/) components from the React SDK to create a chatbox UI.

For both examples, you'll first need to install both `@talkjs/react` and the [`talkjs` JavaScript package](https://www.npmjs.com/package/talkjs):

```sh
npm install talkjs @talkjs/react
# or
yarn add talkjs @talkjs/react
```

### Add an existing user and conversation

This example demonstrates how to create a TalkJS session with an existing user and view a chatbox UI with an existing conversation. We'll use a sample user and conversation that are already included in your [test environment](https://talkjs.com/docs/Features/Environments/).

Add the following code to your React app. Replace the `<APP_ID>` with your test environment App ID from the **Settings** tab of the TalkJS dashboard:

```jsx
import { Session, Chatbox } from "@talkjs/react";

function ChatComponent() {
  return (
    <Session appId="<APP_ID>" userId="sample_user_alice">
      <Chatbox
        conversationId="sample_conversation"
        style={{ width: "100%", height: "500px" }}
      ></Chatbox>
    </Session>
  );
}

export default ChatComponent;
```

### Sync a user and conversation

This example demonstrates how to sync a user and conversation that you create with the JavaScript SDK.

Add the following code to your React app:

```jsx
import { useCallback } from "react";
import Talk from "talkjs";
import { Session, Chatbox } from "@talkjs/react";

function ChatComponent() {
  const syncUser = useCallback(
    () =>
      return new Talk.User({
        id: "nina",
        name: "Nina",
        email: "nina@example.com",
        photoUrl: "https://talkjs.com/new-web/avatar-7.jpg",
        welcomeMessage: "Hi!",
        role: "default",
      }),
    [],
  );

  const syncConversation = useCallback((session) => {
    // JavaScript SDK code here
    const conversation = session.getOrCreateConversation("welcome");

    const other = new Talk.User({
      id: "frank",
      name: "Frank",
      email: "frank@example.com",
      photoUrl: "https://talkjs.com/new-web/avatar-8.jpg",
      welcomeMessage: "Hey, how can I help?",
      role: "default",
    });
    conversation.setParticipant(session.me);
    conversation.setParticipant(other);

    return conversation;
  }, []);

  return (
    <Session appId="<APP_ID>" syncUser={syncUser}>
      <Chatbox
        syncConversation={syncConversation}
        style={{ width: "100%", height: "500px" }}
      ></Chatbox>
    </Session>
  );
}

export default ChatComponent;
```

For more details and explanation, see our [getting started guide](/Getting_Started/Frameworks/React/).

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
