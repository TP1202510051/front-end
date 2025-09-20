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

  // Inicializar iframe
    useEffect(() => {

    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    // Inicializar documento vacío
    doc.open();
    doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
    doc.close();

    const head = doc.head;
    const body = doc.body;

    // Estilos de Tailwind vía <link>
    const styleLink = doc.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href =
        "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
    head.appendChild(styleLink);

    // Contenedor root
    const rootDiv = doc.createElement("div");
    rootDiv.id = "root";
    body.appendChild(rootDiv);

    setMountNode(rootDiv);

    return () => {
        setMountNode(null);
    };
    }, []);

  return (
    <iframe ref={iframeRef} className="w-full h-full border-0" title="jsx-preview">
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
                    id={String(props.id ?? "")}
                    name={String(props.name ?? "")}
                    windowId={selectedWindow?.id ?? 0}
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
  );
};

export default IframeRenderer;
