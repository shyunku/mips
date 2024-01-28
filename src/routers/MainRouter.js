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
import GameLayout from "layouts/GameLayout";
import GameTenSeconds from "components/games/ten-seconds/Main";
import InitialNickname from "pages/InitialNickname";
import Mafia from "components/games/mafia/Main";

const MainRouter = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/entry" element={<Entry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/initial-nickname" element={<InitialNickname />} />
        <Route element={<AuthLayout />}>
          <Route element={<HomeLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/game-creation/:gameId" element={<GameSession />} />
            <Route path="/game-session/:sessionId" element={<GameSession />} />
          </Route>
          <Route element={<GameLayout />}>
            <Route path="/game/1/:sessionId" element={<GameTenSeconds />} />
            <Route path="/game/2/:sessionId" element={<Mafia />} />
          </Route>
        </Route>
        {/* TODO :: add 404 page */}
        <Route path="*" element={<div>404 Page</div>} />
      </Routes>
    </HashRouter>
  );
};

export default MainRouter;
