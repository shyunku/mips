import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "pages/Home";
import Entry from "pages/Entry";
import Login from "pages/Login";
import Signup from "pages/Signup";
import HomeLayout from "layouts/HomeLayout";
import Games from "pages/Games";
import Favorites from "pages/Favorites";
import Settings from "pages/Settings";
import AuthLayout from "layouts/AuthLayout";
import GameSession from "pages/GameSession";

const MainRouter = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<AuthLayout />}>
          <Route element={<HomeLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/game-creation/:gameId" element={<GameSession />} />
            <Route path="/game-session/:sessionId" element={<GameSession />} />
          </Route>
        </Route>
        {/* TODO :: add 404 page */}
        <Route path="*" element={<div>404 Page</div>} />
      </Routes>
    </HashRouter>
  );
};

export default MainRouter;
