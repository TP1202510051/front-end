import { useState } from "react";
import { sendRecoveryEmail } from "@/services/auth.service";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendRecoveryEmail(email);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit(e);
  };

  return (
    <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="link" className="text-sm text-white underline font-semibold hover:text-gray-300" onClick={() => setIsOpen(true)}>
                    Recuperar Contraseña
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--dashboard-background)] rounded-sm outline-none">
                <DialogTitle className="text-white .lato-regular">
                  Ingrese su correo electrónico
                </DialogTitle>
                <div className="mt-4">
                  <Input
                    id="link"
                    placeholder="Nombre..."
                    className="w-full p-2 text-white rounded border focus:outline-none selection:bg-gray-700/50"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    onKeyDown={handleKeyPress}
                  />
                </div>
                <DialogFooter className="pt-2 sm:justify-around">
                  <Button type="submit" variant="secondary" className="cursor-pointer"  onClick={handleSubmit}>
                    Aceptar
                  </Button>
                  <Button type="button" variant="default" className="cursor-pointer"  onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </>
  );
}
