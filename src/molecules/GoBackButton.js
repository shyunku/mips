const { IoArrowBack } = require("react-icons/io5");
const { useNavigate } = require("react-router-dom");

const GoBackButton = ({ handler }) => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="backward" onClick={handler ?? goBack}>
      <div className="icon">
        <IoArrowBack />
      </div>
      <div className="label">뒤로가기</div>
    </div>
  );
};

export default GoBackButton;
