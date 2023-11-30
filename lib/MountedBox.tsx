import React, { CSSProperties, ReactNode, useRef } from "react";
import type Talk from "talkjs";
import { EventListeners } from "./EventListeners";
import { useMountBox } from "./hooks";
import { Func, Mountable } from "./util";

interface Props {
  box: (Talk.UIBox & Mountable) | undefined;
  loadingComponent?: ReactNode;
  style?: CSSProperties;
  className?: string;

  handlers: Record<`on${string}`, Func>;
  children?: React.ReactNode;
}

/**
 * Mounts the given `UIBox` and attaches event handlers to it. Renders a
 * `loadingComponent` fallback until the mount is complete.
 */
export function MountedBox(props: Props & { session: Talk.Session }) {
  const { box, loadingComponent, className, children, handlers } = props;

  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMountBox(box, ref.current);

  const style = mounted ? props.style : { ...props.style, display: "none" };

  return (
    <BoxContext.Provider value={box}>
      {!mounted && (
        <div style={props.style} className={className}>
          {loadingComponent}
        </div>
      )}

      <div ref={ref} style={style} className={className} />
      {children}

      <EventListeners target={box} handlers={handlers} />
    </BoxContext.Provider>
  );
}

export const BoxContext = React.createContext<Talk.UIBox | undefined>(
  undefined,
);
