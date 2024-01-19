import userStore from "stores/userStore";
import "./Header.scss";

const Header = () => {
  const userNickname = userStore((state) => state.nickname);

  return (
    <div className="header">
      <div className="highlight">{userNickname}</div>
      <div className="text">님 환영합니다!</div>
    </div>
  );
};

export default Header;
