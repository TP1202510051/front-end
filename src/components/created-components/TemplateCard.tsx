import type { Template } from "@/models/templateModel";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface TemplateCardProps {
    template: Template;
    onSelect: (template: Template) => void;
}

export const TemplateCard = ({ template, onSelect }: TemplateCardProps) => {
    return (
        <Card className="w-72 shadow-lg bg-[var(--dialog-background)] transition-shadow duration-200 hover:cursor-pointer hover:scale-105" onClick={() => onSelect(template)}>
            {template.image && (
                <img src={template.image} alt={template.name} className="w-full object-cover rounded-t-lg aspect-[3/2]" />
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