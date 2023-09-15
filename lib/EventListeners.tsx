import { useEffect } from "react";
import type Talk from "talkjs";

import { Func } from "./util";

interface Props {
  target?: Talk.UIBox | Talk.Session;
  handlers: Record<`on${string}`, Func>;
}

/**
 * @hack
 * React's rules of hooks won't let us put useEffect in a loop, so this
 * component is a hacky way of achieving that. It renders a bunch of components
 * in a loop which is legal. Those components always render as `null`. Their
 * actual purpose is to hold the `useEffect` call inside of them.
 */
export function EventListeners({ target, handlers }: Props) {
  if (!target?.isAlive) {
    return null;
  }

  const events = Object.keys(handlers) as (keyof typeof handlers)[];
  return events
    .filter((name) => name.startsWith("on"))
    .filter((name) => typeof handlers[name] === "function")
    .map((name) => (
      <EventListener
        key={name}
        name={name}
        handler={handlers[name]}
        target={target}
      />
    ));
}

interface ListenerProps {
  target?: Talk.Session | Talk.UIBox;
  name: string;
  handler: any;
}

/**
 * @hack
 * This component always renders as `null` because its actual purpose is to hold
 * the `useEffect` inside of it. See {@link EventListeners} for more context.
 */
function EventListener(props: ListenerProps) {
  const { handler } = props;
  useEffect(() => {
    if (!props.target?.isAlive) {
      return;
    }

    // Special case: Talk.Session doesn't have onUnreadsChange - instead, we
    // have a weird `session.unreads` object with a single onChange event.
    const { name, target } =
      props.name === "onUnreadsChange"
        ? { name: "onChange", target: (props.target as any).unreads }
        : { name: props.name, target: props.target };

    if (typeof target[name] !== "function") {
      console.warn(
        `[@talkjs/react] Trying to handle event ${name} which does not exist on ${target?.constructor?.name}. Did you make a typo?`,
      );
      return;
    }
    const subscription: Talk.Subscription = target[name](handler);

    return () => {
      subscription.unsubscribe();
    };
  }, [props.target, props.name, handler]);
  return null;
}
