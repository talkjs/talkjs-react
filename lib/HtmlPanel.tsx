import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Talk from "talkjs";
import { BoxContext } from "./MountedBox";

type HtmlPanelProps = {
  /**
   * The URL you want to load inside the HTML panel. The URL can be absolute or
   * relative. We recommend using same origin pages to have better control of
   * the page. Learn more about HTML Panels and same origin pages {@link https://talkjs.com/docs/Features/Customizations/HTML_Panels/ | here}.
   */
  url: string;

  /** The panel height in pixels. Defaults to `100px`. */
  height?: number;

  /** Sets the visibility of the panel. Defaults to `true`. */
  show?: boolean;

  /** If given, the panel will only show up for the conversation that has an `id` matching the one given. */
  conversationId?: string;

  /** The content that gets rendered inside the `<body>` of the panel. */
  children: React.ReactNode;
};

type State =
  | { type: "none" }
  | { type: "loading" }
  | { type: "loaded"; panel: Talk.HtmlPanel };

export function HtmlPanel({
  url,
  height = 100,
  show = true,
  conversationId,
  children,
}: HtmlPanelProps) {
  const [state, setState] = useState<State>({ type: "none" });
  const box = useContext(BoxContext);

  useEffect(() => {
    async function run() {
      if (state.type !== "none" || !box) return;

      setState({ type: "loading" });
      const panel = await box.createHtmlPanel({
        url,
        conversation: conversationId,
        height,
        show,
      });
      await panel.windowLoadedPromise;
      setState({ type: "loaded", panel });
    }

    run();

    return () => {
      if (state.type === "loaded") {
        state.panel.destroy();
        setState({ type: "none" });
      }
    };
    // We intentionally exclude `height` and `show` from the dependency array so
    // that we update them later via methods instead of by re-creating the
    // entire panel from scratch each time.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, url, box, conversationId]);

  useEffect(() => {
    if (state.type === "loaded") {
      state.panel.setHeight(height);
    }
  }, [state, height]);

  useEffect(() => {
    if (state.type === "loaded") {
      if (show) {
        state.panel.show();
      } else {
        state.panel.hide();
      }
    }
  }, [state, show]);

  return (
    <>
      {state.type === "loaded" &&
        createPortal(children, state.panel.window.document.body)}
    </>
  );
}
