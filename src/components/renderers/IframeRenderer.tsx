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

const IframeRenderer: React.FC<IframeRendererProps> = ({
  code,
  selectedWindow,
  onWindowSelect,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    if (!doc) return;

    let isUnmounted = false;

    doc.open();
    doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
    doc.close();

    const head = doc.head;
    const body = doc.body;
    const root = doc.createElement("div");
    root.id = "root";
    body.appendChild(root);

    const tailwind = doc.createElement("script");
    tailwind.src = "https://cdn.tailwindcss.com";

    tailwind.onload = () => {
      if (!isUnmounted) setMountNode(root);
    };
    head.appendChild(tailwind);

    const clickListener = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;
      e.preventDefault();

      const winAttr = link.getAttribute("data-window");
      const prodAttr = link.getAttribute("data-product");

      if (winAttr) {
        const id = Number(winAttr);
        if (!Number.isNaN(id)) {
          window.parent.postMessage({ type: "navigate", window: { id } }, "*");
          return;
        }
      }

      if (prodAttr) {
        const productId = Number(prodAttr);
        (iframe.contentWindow as any).CURRENT_PRODUCT = {
          id: productId || 999,
          name: "Atún Premium 500g",
          description:
            "Atún en conserva de la más alta calidad, rico en proteínas y bajo en grasa. Ideal para comidas saludables.",
          price: 15.9,
          discount: 2.0,
          image:
            "https://firebasestorage.googleapis.com/v0/b/abstractify-v2.firebasestorage.app/o/public%2Ftuna-can.jpg?alt=media",
          stock: 120,
          categoryId: 10,
        };
        window.parent.postMessage({ type: "open-product", productId }, "*");
      }
    };

    doc.addEventListener("click", clickListener);

    return () => {
      isUnmounted = true;
      try {
        iframe.contentDocument?.removeEventListener("click", clickListener);
        iframe.contentDocument!.body.innerHTML = "";
      } catch { /* empty */ }
      setMountNode(null);
      setComponent(null);
    };
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === "navigate") onWindowSelect(event.data.window as AppWindow);
      if (event.data.type === "open-product") {
        onWindowSelect({
          id: selectedWindow?.id ?? 0,
          name: "Producto Detalle",
          productId: event.data.productId,
        } as any);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onWindowSelect, selectedWindow]);

  useEffect(() => {
    if (!code || !mountNode) return;

    try {
      const cleanedCode = code
        .replace(/^<>/, "")
        .replace(/<\/>$/, "")
        .replace(/```[a-zA-Z]*\n?/g, "")
        .trim();

      let transpiled = Babel.transform(cleanedCode, {
        presets: ["react", "typescript"],
        filename: "dynamic.tsx",
      }).code;
      if (!transpiled) return;

      transpiled = transpiled
        .replace(/imageUrl/g, "image")
        .replace(
          /const\s+fetchProduct\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\};/,
          `
          const fetchProduct = async () => {
            const fakeProduct = {
              id: 999,
              name: "Producto de ejemplo",
              description: "Producto simulado para vista previa.",
              price: 39.9,
              discount: 5,
              image: "https://placehold.co/600x400",
              stock: 50
            };
            setProduct(fakeProduct);
            setLoading(false);
          };
          `
        )
        .replace(
          /https:\/\/back-end-126860328325\.southamerica-east1\.run\.app/g,
          "http://localhost:8080"
        )
        .replace(/export\s+default/, "exports.default =");

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