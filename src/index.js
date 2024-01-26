import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import MainRouter from "./routers/MainRouter";
import "styles/reset.scss";
import "styles/index.scss";
import "styles/default.scss";
import { Toaster } from "react-hot-toast";
import socketStore from "stores/socketStore";
import userStore from "stores/userStore";
import { Modaler } from "molecules/Modal";
import ModalRouter from "routers/ModalRouter";

const root = ReactDOM.createRoot(document.getElementById("root"));
socketStore.getState().initialize();
console.log("User: ", userStore.getState().nickname);
root.render(
  <>
    <Toaster position="top-center" reverseOrder={false} />
    <ModalRouter />
    <MainRouter />
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
