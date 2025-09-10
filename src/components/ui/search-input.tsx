import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SearchInput = () => {
  return (
    <div className="relative w-full md:w-1/2">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Buscar..."
        className="w-full pl-10 pr-4 py-2 bg-transparent border-gray-600/50 focus:border-sky-500 focus:ring-0 text-white placeholder:text-gray-400"
      />
    </div>
  );
};

export default SearchInput;
