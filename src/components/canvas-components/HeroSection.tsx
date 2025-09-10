interface HeroSectionProps {
  title: string;
};

export function HeroSection({ title }: HeroSectionProps) {
  return (
    <div className="w-[600px] h-[260px] bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <p className="text-zinc-400 text-sm">Hero Section</p>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
    </div>
  );
}