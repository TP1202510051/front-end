interface ProductGridProps {
  category: string;
}

export function ProductGrid({ category }: ProductGridProps) {
  return (
    <div className="w-[600px] h-[400px] bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center pointer-events-none">
       <div className="text-center">
        <p className="text-zinc-400 text-sm">Product Grid</p>
        <h2 className="text-2xl font-bold text-white">Categoría: {category}</h2>
      </div>
    </div>
  );
}