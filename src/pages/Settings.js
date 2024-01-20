import { IoLogOut } from "react-icons/io5";
import "./Settings.scss";
import userStore from "stores/userStore";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const user = userStore((state) => state);

  const logout = () => {
    // TODO :: logout (delete on db)
    user.clear();
    navigate("/entry");
  };

  return (
    <>
      <div className="container join-game">
        <div className="label">사용자 설정</div>
        <div className="sub-content">
          <div className="menus">
            <div className="menu" onClick={logout}>
              <div className="icon">
                <IoLogOut />
              </div>
              <div className="label">로그아웃</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
