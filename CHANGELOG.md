## v0.1.9

- Added `"use client"` banner to build outputs

## v0.1.8

- Added `token` and `tokenFetcher` props to [Session](https://talkjs.com/docs/Reference/React_Native_SDK/Components/Session/). For more details on how to use JSON Web Token (JWT)-based authentication, see the [authentication documentation](https://talkjs.com/docs/Features/Security_Settings/Authentication/).
- Deprecated the `signature` prop on the [Session](https://talkjs.com/docs/Reference/React_Native_SDK/Components/Session/) component. Signature-based authentication continues to be supported indefinitely, but JWT-based authentication is recommended for new projects.

## v0.1.7

- Added `show` prop to `Popup`, that allows you to specify whether the popup should be shown or hidden.

## v0.1.6

- Added `asGuest?: boolean` prop to `Chatbox`, `Inbox` and `Popup`.

## v0.1.5

- Output ES2015.

## v0.1.4

- Added `useUnreads` hook.


## v0.1.3

- Added `signature?: string` prop to `Session`.

## v0.1.2

- ~~Add `signature?: string` prop to `Session`.~~

## v0.1.1

- Removed "experimental" label from README.