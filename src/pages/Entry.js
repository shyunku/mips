import { useNavigate } from "react-router-dom";

const Entry = () => {
  const navigate = useNavigate();

  const goToLoginPage = () => {
    navigate("/login");
  };

  return (
    <div className="entry page">
      <div className="logo">
        <div className="title">MIPS</div>
        <div className="subtitle">WEB 미니게임 플레이스테이션</div>
      </div>
      <div className="main-btn-container">
        <button className="main-btn highlight" onClick={goToLoginPage}>
          로그인
        </button>
        <button className="main-btn">회원가입 없이 시작</button>
      </div>
    </div>
  );
};

export default Entry;
