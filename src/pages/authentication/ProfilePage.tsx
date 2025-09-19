/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/firebase";
import type { UserProfileData } from "@/models/userProfileData";
import { mergeProfile } from "@/utils/mappers/profile.mapper";
import { toast } from "react-toastify";
import { buildUpdatePayload } from "@/utils/mappers/buildUserToSave.mapper";
import { uploadFiles } from "@/utils/helpers/uploadFiles";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";

export default function ProfilePage() {
  const currentUser = auth.currentUser;
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extraData, setExtraData] = useState<UserProfileData | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setExtraData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      getUserProfile(currentUser.uid).then((data) => {
        const mergedProfile = mergeProfile(data, extraData, currentUser);
        setProfile(mergedProfile);
        setLoading(false);
      });
    }
  }, [currentUser, extraData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
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
    const payload = buildUpdatePayload(profile);
    await updateUserProfile(currentUser.uid, payload);

    const uploaded = await uploadFiles(currentUser.uid, [
      { file: profilePictureFile, field: "profilePictureUrl" },
      { file: companyLogoFile, field: "company.logoUrl" },
    ]);
    console.log("📂 Resultados de subida:", uploaded);

    setProfile((prev) => (prev ? { ...prev, ...uploaded } : prev));

    toast.success("¡Perfil actualizado con éxito!");
    setProfilePictureFile(null);
    setCompanyLogoFile(null);
  } catch (error) {
    toast.error("Error al actualizar el perfil." + (error instanceof Error ? error.message : String(error)));
  } finally {
    setSaving(false);
  }
};

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <div>No se pudo cargar el perfil.</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader >
          <CardTitle className="text-2xl">Mi Perfil</CardTitle>
          <CardDescription className="text-lg">Actualiza tu información personal y la de tu empresa.</CardDescription>
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
              <Avatar className="h-20 w-20 rounded-full bg-primary">
                <AvatarImage src={profile.company?.logoUrl} alt="Logo de la empresa" />
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
          
          <Button onClick={handleSaveChanges} disabled={saving} variant="inverseDark">
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}