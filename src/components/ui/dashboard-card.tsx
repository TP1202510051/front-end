import { Link } from 'react-router';
import { Card, CardContent, CardFooter } from './card';
import { Clock } from 'lucide-react';

type DashboardCardProps = {
  id: string;
  imageUrl: string;
  title: string;
  lastEdited?: string;
};

const DashboardCard = ({ id, imageUrl, title, lastEdited }: DashboardCardProps) => {
  return (
    <Link to={`/design-interface/${id}/${title}`} className="block h-full">
      <Card
        className="w-full py-0 gap-0 overflow-hidden rounded-lg bg-[var(--card-background)]/40 backdrop-blur-sm border border-white/10 
      hover:border-sky-400 hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        <CardContent className="p-0">
          <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />
        </CardContent>

        <CardFooter className="flex flex-col flex-grow items-start p-4 pt-2 .lato-regular">
          <div className="text-md text-white">{title}</div>
          <div className="flex items-center gap-2 text-xs mt-auto text-gray-400 mt-1">
            <Clock className="h-3 w-3" />
            <span>{lastEdited}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DashboardCard;
