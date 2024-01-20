import { useMemo } from "react";
import { IoGameController, IoHome, IoSettings, IoSettingsSharp, IoStar } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import JsxUtil from "util/JsxUtil";
import "./Footer.scss";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pageName = useMemo(() => {
    return location.pathname.split("/")[1];
  }, [location]);

  const goToHomePage = () => {
    navigate("/");
  };

  const goToGamePage = () => {
    navigate("/games");
  };

  const goToFavoritePage = () => {
    navigate("/favorites");
  };

  const goToSettingPage = () => {
    navigate("/settings");
  };

  return (
    <div className="footer">
      <div className={"menu" + JsxUtil.classByEqual(pageName, "", "highlight")} onClick={goToHomePage}>
        <div className="icon">
          <IoHome />
        </div>
        <div className="text">홈</div>
      </div>
      <div className={"menu" + JsxUtil.classByEqual(pageName, "games", "highlight")} onClick={goToGamePage}>
        <div className="icon">
          <IoGameController />
        </div>
        <div className="text">게임</div>
      </div>
      <div className={"menu" + JsxUtil.classByEqual(pageName, "favorites", "highlight")} onClick={goToFavoritePage}>
        <div className="icon">
          <IoStar />
        </div>
        <div className="text">즐겨찾기</div>
      </div>
      <div className={"menu" + JsxUtil.classByEqual(pageName, "settings", "highlight")} onClick={goToSettingPage}>
        <div className="icon">
          <IoSettingsSharp />
        </div>
        <div className="text">설정</div>
      </div>
    </div>
  );
};

export default Footer;
