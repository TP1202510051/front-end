import { useState } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


const ChatInterface = () => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: { key: string; }) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[#2C2C2C] text-white flex flex-col justify-between h-screen">
      <div className="flex flex-col items-center justify-center flex-grow w-full max-w-4xl p-8 gap-10 mx-auto">
        <h1 className="text-4xl font-extrabold mb-8">Ciska</h1>
        <div className="grid grid-cols-3 gap-4 w-full">
          {[...Array(6)].map((_, index) => (
            <button key={index} className="bg-[#343540] text-white py-14 px-4 rounded-lg hover:bg-[#3c3d49] transition">
              Lorem ipsum dolor sit amet
            </button>
          ))}
        </div>
      </div>
      <div className="w-full flex justify-center px-4 py-10 gap-5">
        <Button type="button" variant="ghost" className="cursor-pointer"  onClick={handleSendMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </Button>
        <Input
          id="link"
          placeholder="Explicame la interfaz que deseas disenar..."
          className="w-full p-2 text-white rounded border focus:outline-none selection:bg-gray-700/50"
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          value={message}
        />
        <Button type="button" variant="ghost" className="cursor-pointer"  onClick={handleSendMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
