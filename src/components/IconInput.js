import JsxUtil from "util/JsxUtil";
import "./IconInput.scss";

const IconInput = ({
  value,
  onChange,
  icon,
  iconColor = "inherit",
  placeholder,
  className,
  type = "text",
  ...rest
}) => {
  return (
    <div className={"icon-input" + JsxUtil.class(className)} {...rest}>
      <div className="icon" style={{ color: iconColor }}>
        {icon}
      </div>
      <input type={type} onChange={onChange} value={value} placeholder={placeholder} />
    </div>
  );
};

export default IconInput;
