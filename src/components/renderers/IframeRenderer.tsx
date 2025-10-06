/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as Babel from "@babel/standalone";
import type { AppWindow } from "@/models/windowModel";
import ComponentWrapper from "../created-components/ComponentWrapper";

interface IframeRendererProps {
  code: string;
  selectedWindow: AppWindow | null;
  onWindowSelect: (window: AppWindow | null) => void;
}

const IframeRenderer: React.FC<IframeRendererProps> = ({ code, onWindowSelect }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

useEffect(() => {
  if (!iframeRef.current) return;
  const doc = iframeRef.current.contentDocument;
  if (!doc) return;

  doc.open();
  doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
  doc.close();

  const head = doc.head;
  const body = doc.body;

  // Inyecta Tailwind primero
  const tailwindScript = doc.createElement("script");
  tailwindScript.src = "https://cdn.tailwindcss.com";

  // Inyecta SockJS y StompJS después (o como prefieras)
  const sockJsScript = doc.createElement("script");
  sockJsScript.src = "https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js";
  const stompJsScript = doc.createElement("script");
  stompJsScript.src = "https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js";

  // Unir carga ordenada: esperar que se cargue todo
  tailwindScript.onload = () => {
    sockJsScript.onload = () => {
      stompJsScript.onload = () => {
        const rootDiv = doc.createElement("div");
        rootDiv.id = "root";
        body.appendChild(rootDiv);
        setMountNode(rootDiv);
      };
      head.appendChild(stompJsScript);
    };
    head.appendChild(sockJsScript);
  };

  head.appendChild(tailwindScript);

  // listener para clics en el iframe
  const clickListener = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      e.preventDefault();
      const winAttr = (target as HTMLAnchorElement).getAttribute("data-window");
      if (winAttr) {
        const id = Number(winAttr);
        if (!isNaN(id)) {
          window.parent.postMessage({ type: "navigate", window: { id, name: null } }, "*");
        }
      }
    }
  };
  doc.addEventListener("click", clickListener);

  return () => {
    doc.removeEventListener("click", clickListener);
    setMountNode(null);
    setComponent(null);
  };
}, []);


  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === "navigate") {
        onWindowSelect(event.data.window as AppWindow);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onWindowSelect]);

useEffect(() => {
  if (!code || !mountNode) return;

  try {
    const cleanedCode = code
      .replace(/^<>/, "")              // quita fragmento abierto al inicio
      .replace(/<\/>$/, "")            // quita fragmento cerrado al final
      .replace(/```[a-zA-Z]*\n?/g, "") // quita fences tipo ```jsx o ```
      .trim();

    let transpiled = Babel.transform(cleanedCode, {
      presets: ["react", "typescript"],
      filename: "dynamic.tsx"
    }).code;

    if (!transpiled) return;

    // transpiled = transpiled.replace(
    //   /https:\/\/back-end-76685875773\.europe-west1\.run\.app/g,
    //   "http://localhost:8080"
    // );
    transpiled = transpiled.replace(/export\s+default/, "exports.default =");

    const moduleExports: Record<string, unknown> = {};
    const fn = new Function(
      "React",
      "useState",
      "useEffect",
      "useContext",
      "useReducer",
      "useRef",
      "ComponentWrapper",
      "SockJS",
      "Stomp",
      "exports",
      transpiled
    );

    fn(
      React,
      React.useState,
      React.useEffect,
      React.useContext,
      React.useReducer,
      React.useRef,
      ComponentWrapper,
      (iframeRef.current!.contentWindow as any).SockJS,
      (iframeRef.current!.contentWindow as any).Stomp,
      moduleExports
    );

    const Comp = moduleExports.default as React.ComponentType;
    setComponent(() => Comp);
  } catch (error) {
    console.error("❌ Error ejecutando código dinámico:", error);
    setComponent(null);
  }
}, [code, mountNode]);


  return (
    <iframe ref={iframeRef} className="w-full h-full" title="jsx-preview">
      {mountNode && Component && createPortal(<Component />, mountNode)}
    </iframe>
  );
};

export default IframeRenderer;
