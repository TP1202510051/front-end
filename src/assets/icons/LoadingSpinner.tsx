interface SpinnerProps {
    text: string
};

export const Spinner = ({ text }: SpinnerProps) => (
    <div className='fixed h-full w-full top-0 left-0 bg-black opacity-80 z-50 flex items-center justify-center text-white flex-col gap-4'>
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-2xl">{text}</h1>
    </div>
);