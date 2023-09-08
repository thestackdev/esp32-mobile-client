import { io } from "socket.io-client";
const socket = io.connect("https://esp32.shanmukeshwar.dev");
export default socket;
