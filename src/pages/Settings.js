import { IoLogOut } from "react-icons/io5";
import "./Settings.scss";
import userStore from "stores/userStore";
import { useNavigate } from "react-router-dom";
import { signOutReq } from "Requests/User.req";
import socketStore from "stores/socketStore";

const Settings = () => {
  const navigate = useNavigate();
  const user = userStore((state) => state);

  const logout = async () => {
    try {
      await signOutReq();
    } catch (err) {
      console.error(err);
    } finally {
      user.clear();
      navigate("/entry");
    }
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
