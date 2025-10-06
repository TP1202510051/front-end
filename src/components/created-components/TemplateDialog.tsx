import { Button } from "../ui/button";
import { getTemplates } from "@/services/template.service";
import type { Template, TemplateRequest } from "@/models/templateModel";
import { useState } from "react";
import { TemplateCard } from "./TemplateCard";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle } from "../ui/dialog";
import { BackIcon } from "@/assets/icons/Back";
import { NextIcon } from "@/assets/icons/NextIcon";
import { setTemplate } from "@/services/template.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

export const TemplateDialog = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<number>(1);
    const { firebaseUser } = useAuth();
    const navigate = useNavigate();

    const openDialog = async () => {
        try {
            const fetchedTemplates = await getTemplates();
            setTemplates(fetchedTemplates);
            setIsOpen(true);
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const changeTemplate = (newPosition: number) => {
        setPosition(newPosition);
    }

    const handleTemplateSelect = async (templateId: number) => {
        try {
            const userId = firebaseUser?.uid ?? "";
            const request: TemplateRequest = { templateId, userId };
            const data = await setTemplate(request);
            toast.success('Proyecto creado con éxito!');
            navigate(`/design-interface/${data.projectId}/${data.projectName}`);
        } catch (error) {
            console.error("Error selecting template:", error);
        }
    };

    const closeDialog = () => setIsOpen(false);
    return (
        <>
            <Button variant="secondary" onClick={openDialog}>New from Template</Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="rounded-lg bg-primary shadow-lg">
                    <DialogTitle className="text-2xl font-bold mb-4">Selecciona una plantilla</DialogTitle>
                    <div className="flex content-center items-center justify-between gap-4">
                        <Button onClick={() => changeTemplate(position - 1)} disabled={position === 1}><BackIcon /></Button>
                        {templates.length > 0 && templates[position - 1] && (
                            <TemplateCard
                                key={templates[position - 1].id}
                                template={templates[position - 1]}
                                onSelect={() => {
                                    handleTemplateSelect(templates[position - 1].id);
                                    console.log("Selected template ID:", templates[position - 1].id);
                                }}
                            />
                        )}
                        <Button onClick={() => changeTemplate(position + 1)} disabled={position === 4}><NextIcon /></Button>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" onClick={closeDialog}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};