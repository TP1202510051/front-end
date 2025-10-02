import type SockJS from "sockjs-client";
import type { Client as StompClient } from "@stomp/stompjs";

declare global {
  interface Window {
    SockJS: typeof SockJS;
    Stomp: { over: (socket: WebSocket | InstanceType<typeof SockJS>) => StompClient };
  }
}