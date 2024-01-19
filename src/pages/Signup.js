import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const goToEntryPage = () => {
    navigate("/");
  };

  return (
    <div className="login page">
      <div className="mips">MIPS</div>
      <div className="label">회원가입 </div>
      <div className="input-container">
        <input type="text" placeholder="아이디" />
        <input type="text" placeholder="닉네임 (옵션)" />
        <input type="password" placeholder="비밀번호" />
        <input type="password" placeholder="비밀번호 확인" />
      </div>
      <div className="main-btn-container">
        <button className="main-btn highlight">회원가입 </button>
        <button className="main-btn unhighlight" onClick={goToEntryPage}>
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default Signup;
