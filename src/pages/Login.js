import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goToSignupPage = () => {
    navigate("/signup");
  };

  return (
    <div className="login page">
      {/* <div className="mips">MIPS</div> */}
      <div className="label">로그인</div>
      <div className="input-container">
        <input className="main-input" type="text" placeholder="아이디" />
        <input className="main-input" type="password" placeholder="비밀번호" />
        <div className="sign-up" onClick={goToSignupPage}>
          아직 회원이 아니신가요?
        </div>
      </div>
      <div className="main-btn-container">
        <button className="main-btn highlight">로그인</button>
        <button className="main-btn unhighlight" onClick={goBack}>
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default Login;
