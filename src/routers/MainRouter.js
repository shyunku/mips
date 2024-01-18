import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "pages/Home";
import Entry from "pages/Entry";
import Login from "pages/Login";

const MainRouter = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<div>404 Page</div>} />
      </Routes>
    </HashRouter>
  );
};

export default MainRouter;
