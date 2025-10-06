import type { Template } from "@/models/templateModel";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

export const TemplateCard = ({ template, onSelect }: TemplateCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onSelect(template);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card
      className={`w-72 shadow-lg bg-[var(--dialog-background)] transition-all duration-200 
        ${isProcessing ? "opacity-60 cursor-not-allowed scale-100" : "hover:cursor-pointer hover:scale-105"}`}
      onClick={handleClick}
    >
      {template.image && (
        <img
          src={template.image}
          alt={template.name}
          className="w-full object-cover rounded-t-lg aspect-[3/2]"
          draggable={false}
        />
      )}
      <CardHeader>
        <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{template.description}</p>
      </CardContent>
    </Card>
  );
};
