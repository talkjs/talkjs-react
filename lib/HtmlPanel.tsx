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

export function HtmlPanel({
  url,
  height = 100,
  show = true,
  conversationId,
  children,
}: HtmlPanelProps) {
  const [panel, setPanel] = useState<undefined | Talk.HtmlPanel>(undefined);
  const box = useContext(BoxContext);

  useEffect(() => {
    async function run() {
      if (!box || panel) return Promise.resolve(panel);

      const newPanel = await box.createHtmlPanel({
        url,
        conversation: conversationId,
        height,
        show: false,
      });

      await newPanel.DOMContentLoadedPromise;
      if (show) {
        newPanel.show();
      }

      setPanel(newPanel);
      return newPanel;
    }

    const panelPromise = run();

    return () => {
      panelPromise.then((panel) => {
        panel?.destroy().then(() => {
          setPanel(undefined);
        });
      });
    };
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

  return <>{panel && createPortal(children, panel.window.document.body)}</>;
}
