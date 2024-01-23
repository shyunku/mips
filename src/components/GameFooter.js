import { useMemo } from "react";
import { IoGameController, IoHome, IoSettings, IoSettingsSharp, IoStar } from "react-icons/io5";
import JsxUtil from "util/JsxUtil";
import "./Footer.scss";

const GameFooter = ({ menus = [], selectedMenuKey }) => {
  return (
    <div className="footer game-footer">
      {(menus ?? []).map((menu, ind) => {
        return (
          <div
            className={"menu" + JsxUtil.classByEqual(menu?.key, selectedMenuKey, "highlight")}
            onClick={menu?.onClick ?? null}
            key={ind}
          >
            <div className="icon">{menu?.icon ?? <IoHome />}</div>
            <div className="text">{menu?.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default GameFooter;
