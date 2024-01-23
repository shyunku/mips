import { create } from "zustand";
import io from "socket.io-client";
import userStore from "./userStore";
import SocketTopics from "types/SocketTopics";

const SERVER_HOST = process.env.REACT_APP_SERVER_HOST;
const SERVER_SOCKET_PORT = process.env.REACT_APP_SERVER_SOCKET_PORT;

const socketStore = create((set) => ({
  socket: null,
  initialize: () => {
    const token = userStore.getState().token;

    userStore.subscribe(
      (user) => {
        if (user.token != null) {
          invokeSocket();
        } else {
          destroySocket();
        }
      },
      (state) => state.token != null
    );

    if (token) {
      invokeSocket();
    }
  },
  destroy: () => {
    destroySocket(socketStore.getState().socket);
    return set({ socket: null });
  },
}));

const invokeSocket = () => {
  const prevSocket = socketStore.getState().socket;
  if (prevSocket) {
    prevSocket.close();
  }

  // initialize socket
  console.log("initialize socket:", userStore.getState().nickname);
  const socket = io(`http://${SERVER_HOST}:${SERVER_SOCKET_PORT}`, {
    transports: ["websocket"],
    auth: {
      token: userStore.getState().token,
    },
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error(err);
  });

  socket.on("connect_timeout", (timeout) => {
    console.error(timeout);
  });

  socket.on("error", (err) => {
    console.error(err);
  });

  socket.on("message", (msg) => {
    console.log(msg);
  });

  socket.emitSession = (sessionId, topic, ...args) => {
    socket?.emit(SocketTopics.SESSION_INGAME, parseInt(sessionId), topic, ...args);
  };

  socketStore.setState({ socket });
};

const destroySocket = () => {
  const prevSocket = socketStore.getState().socket;
  if (prevSocket) {
    prevSocket.close();
  }

  socketStore.setState({ socket: null });
};

export default socketStore;
