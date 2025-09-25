import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import JsxParser from "react-jsx-parser";
import { normalizeJSX } from "@/utils/handlers/jsxUtils";
import ComponentWrapper from "@/components/created-components/ComponentWrapper";
import type { AppWindow } from "@/models/windowModel";

interface IframeRendererProps {
  code: string;
  selectedWindow: AppWindow | null;
}

const IframeRenderer: React.FC<IframeRendererProps> = ({ code, selectedWindow }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    useEffect(() => {

      if (!iframeRef.current) return;
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;

      doc.open();
      doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
      doc.close();

      const head = doc.head;
      const body = doc.body;

      const script = doc.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      head.appendChild(script);

      const rootDiv = doc.createElement("div");
      rootDiv.id = "root";
      body.appendChild(rootDiv);

      setMountNode(rootDiv);

      return () => {
          setMountNode(null);
      };
    }, []);

  return (
    <>
    <iframe ref={iframeRef} className="w-full h-full" title="jsx-preview">
      {mountNode &&
        (
        createPortal(
          code && code.trim().length > 0 ? (
            <JsxParser
              jsx={normalizeJSX(code)}
              allowUnknownElements
              showWarnings
              bindings={{ Array, Math, Date, JSON }}
              components={{
                ComponentWrapper: (props: Record<string, unknown>) => (
                <ComponentWrapper
                  id={props.id && !isNaN(Number(props.id)) ? String(props.id) : ""}
                  name={String(props.name ?? "")}
                  windowId={selectedWindow?.id ? String(selectedWindow.id) : "0"}
                >
                  {props.children as React.ReactNode}
                </ComponentWrapper>
                ),
              }}
            />
          ) : (
            <p style={{ color: "gray" }}>Sin contenido</p>
          ),
          mountNode
        ))}
    </iframe>
    </>
  );
};

export default IframeRenderer;
