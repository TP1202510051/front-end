// src/components/auth/UserNav.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/services/auth.service";
import { getUserProfile } from "@/services/user.service";
import { dashboard, profile as profileR, login, register } from "@/utils/constants/navigations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      getUserProfile(currentUser.uid).then(setProfile);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline">
          <Link to={login}>Iniciar Sesión</Link>
        </Button>
        <Button asChild>
          <Link to={register}>Registrarse</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={profile?.profilePictureUrl}
              alt={profile?.firstName || "Usuario"}
            />
            <AvatarFallback>
              {profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile ? `${profile.firstName} ${profile.lastName}` : "Cargando..."}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={profileR}>
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={dashboard}>
              Dashboard
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}