const SocketTopics = {
  SESSION_JOIN: "session/join",
  SESSION_START: "session/start",
  SESSION_LEAVE: "session/leave",
  SESSION_END: "session/end",
  SESSION_INGAME: "session/ingame",
  SESSION_INITIALIZE: "session/initialize",
};

export const SessionTopics = {
  ROUND_INITIALIZE: "round/initialize",
  ROUND_START: "round/start",
  ROUND_ENDED: "round/ended",
};

export default SocketTopics;
