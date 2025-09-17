import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="relative w-full md:w-1/2">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--nav-foreground)]" />
      <Input
        type="text"
        placeholder="Buscar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border-[var(--nav-foreground)]/50 focus:border-sky-500 focus:ring-0 text-[var(--nav-foreground)] placeholder:text-[var(--nav-foreground)]"
      />
    </div>
  );
};

export default SearchInput;
