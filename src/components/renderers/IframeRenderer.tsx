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

    doc.addEventListener("click", (e) => {
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
    });

    const head = doc.head;
    const body = doc.body;

    const script = doc.createElement("script");
    script.src = "https://cdn.tailwindcss.com";

    script.onload = () => {
      const rootDiv = doc.createElement("div");
      rootDiv.id = "root";
      body.appendChild(rootDiv);
      setMountNode(rootDiv);
    };

    head.appendChild(script);

    return () => {
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
      let transpiled = Babel.transform(code, {
        presets: ["react", "typescript"],
        filename: "dynamic.tsx",
      }).code;

      if (!transpiled) return;

      // Reemplazar `export default` por `exports.default =`
      transpiled = transpiled.replace(/export\s+default/, "exports.default =");

      // Crear módulo dinámico
      const moduleExports: Record<string, unknown> = {};
      const fn = new Function(
        "React",
        "useState",
        "useEffect",
        "useContext",
        "useReducer",
        "useRef",
        "ComponentWrapper",
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
