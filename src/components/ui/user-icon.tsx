import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserIconProps = {
  imgUrl: string;
};

const UserIcon = ({ imgUrl }: UserIconProps) => {
  return (
    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
      <Avatar className="h-10 w-10">
        <AvatarImage src={imgUrl} alt="User Avatar" />
        <AvatarFallback>User</AvatarFallback>
      </Avatar>
    </Button>
  );
};

export default UserIcon;
