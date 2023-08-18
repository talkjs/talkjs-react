import { CSSProperties, ReactNode, useRef } from "react";
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
}

/**
 * Mounts the given `UIBox` and attaches event handlers to it. Renders a
 * `loadingComponent` fallback until the mount is complete.
 */
export function MountedBox(props: Props & { session: Talk.Session }) {
  const { box, loadingComponent, className, handlers } = props;

  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMountBox(box, ref.current);

  const style = mounted ? props.style : { ...props.style, display: "none" };

  return (
    <>
      {!mounted && (
        <div style={props.style} className={className}>
          {loadingComponent}
        </div>
      )}

      <div ref={ref} style={style} className={className} />

      <EventListeners target={box} handlers={handlers} />
    </>
  );
}
