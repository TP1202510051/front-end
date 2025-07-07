/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ProfilePage.tsx

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, uploadFileAndUpdateProfile } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para los archivos de imagen
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (currentUser) {
      getUserProfile(currentUser.uid).then((data) => {
        setProfile(data);
        setLoading(false);
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Manejar campos anidados (empresa)
    if (id.startsWith('company.')) {
        const field = id.split('.')[1];
        setProfile((prev: any) => ({
            ...prev,
            company: { ...prev.company, [field]: value }
        }));
    } else {
        setProfile((prev: any) => ({ ...prev, [id]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.id === 'profilePicture') {
        setProfilePictureFile(e.target.files[0]);
      } else if (e.target.id === 'companyLogo') {
        setCompanyLogoFile(e.target.files[0]);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!currentUser || !profile) return;
    setSaving(true);

    try {
      // 1. Actualizar los datos de texto
      const textDataToUpdate = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        company: profile.company
      };
      await updateUserProfile(currentUser.uid, textDataToUpdate);

      // 2. Subir la foto de perfil si se seleccionó una nueva
      if (profilePictureFile) {
        await uploadFileAndUpdateProfile(currentUser.uid, profilePictureFile, 'profilePictureUrl');
      }

      // 3. Subir el logo de la empresa si se seleccionó uno nuevo
      if (companyLogoFile) {
        await uploadFileAndUpdateProfile(currentUser.uid, companyLogoFile, 'companyLogoUrl');
      }
      
      alert("¡Perfil actualizado con éxito!");
      // Opcional: Recargar los datos o simplemente limpiar los estados de los archivos
      setProfilePictureFile(null);
      setCompanyLogoFile(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando perfil...</div>;
  if (!profile) return <div>No se pudo cargar el perfil.</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal y la de tu empresa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* SECCIÓN DATOS PERSONALES */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datos Personales</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profilePictureUrl} alt="Foto de perfil" />
                <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1.5">
                <Label htmlFor="profilePicture">Cambiar foto de perfil</Label>
                <Input id="profilePicture" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" value={profile.firstName || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" value={profile.lastName || ''} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={profile.email || ''} readOnly disabled />
              </div>
            </div>
          </div>

          {/* SECCIÓN DATOS DE LA EMPRESA */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Datos de la Empresa</h3>
             <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 rounded-md">
                <AvatarImage src={profile.company?.companyLogoUrl} alt="Logo de la empresa" />
                <AvatarFallback>{profile.company?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1.5">
                <Label htmlFor="companyLogo">Cambiar logo de la empresa</Label>
                <Input id="companyLogo" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="company.name">Nombre de la Empresa</Label>
                    <Input id="company.name" value={profile.company?.name || ''} onChange={handleInputChange} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="company.ruc">RUC</Label>
                    <Input id="company.ruc" value={profile.company?.ruc || ''} onChange={handleInputChange} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="company.address">Dirección</Label>
                    <Input id="company.address" value={profile.company?.address || ''} onChange={handleInputChange} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="company.phone">Teléfono de Contacto</Label>
                    <Input id="company.phone" value={profile.company?.phone || ''} onChange={handleInputChange} />
                </div>
            </div>
          </div>
          
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}