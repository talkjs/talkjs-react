import { useContext, useEffect, useRef, useState } from "react";
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

export function HtmlPanel({
  url,
  height = 100,
  show = true,
  conversationId,
  children,
}: HtmlPanelProps) {
  const panelPromise = useRef<undefined | Promise<Talk.HtmlPanel>>(undefined);
  const [panel, setPanel] = useState<undefined | Talk.HtmlPanel>(undefined);
  const box = useContext(BoxContext);

  useEffect(() => {
    function run() {
      console.log("@@trying");
      if (!box || panelPromise.current) return;
      console.log("@@initializing");

      // const old = await panelPromise;
      // old?.destroy();

      const panel = box
        .createHtmlPanel({ url, conversation: conversationId, height, show })
        .then(async (panel) => {
          await panel.windowLoadedPromise;
          console.log("@@window loaded");
          // setPanel(panel);
          return panel;
        });

      panelPromise.current = panel;
    }

    run();

    // return () => {
    //   console.log("@@cleanup", panelPromise);
    //   if (panelPromise) {
    //     panelPromise.current?.then((panel) => {
    //       panelPromise.current = undefined;
    //       panel.destroy().then(() => {
    //         console.log("@@deleted");
    //         setPanel(undefined);
    //       });
    //     });
    //   } else {
    //     setPanel(undefined);
    //   }
    // };
    // We intentionally exclude `height` and `show` from the dependency array so
    // that we update them later via methods instead of by re-creating the
    // entire panel from scratch each time.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, box, conversationId]);

  useEffect(() => {
    panel?.setHeight(height);
  }, [panel, height]);

  useEffect(() => {
    if (show) {
      panel?.show();
    } else {
      panel?.hide();
    }
  }, [panel, show]);

  // return <>{panel && createPortal(children, panel.window.document.body)}</>;
  return null;
}
