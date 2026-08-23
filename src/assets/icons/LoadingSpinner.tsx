interface SpinnerProps {
    text: string
}

export const Spinner = ({ text }: SpinnerProps) => (
    <div
        className='fixed h-full w-full top-0 left-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center text-white flex-col gap-6 animate-fadeIn'
        role="alert"
        aria-live="assertive"
        aria-busy="true"
    >
        <div className="relative">
            {/* Spinner principal */}
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            {/* Anillo interior para efecto de doble spinner */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-white/30 border-b-white/80 rounded-full animate-spin-reverse"></div>
            {/* Punto pulsante en el centro */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">{text}</h1>
            <div className="flex gap-1 justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    </div>
);