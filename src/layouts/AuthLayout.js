import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import socketStore from "stores/socketStore";
import userStore from "stores/userStore";

const AuthLayout = () => {
  const navigate = useNavigate();

  const [authorizing, setAuthorizing] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const user = userStore((state) => state);
  const autoGenerated = useMemo(() => user.autoGenerated, [user]);

  useEffect(() => {
    if (autoGenerated) {
      if (user.token != null) {
        // TODO :: verify token
        setAuthorized(true);
      }
    }
    setAuthorizing(false);
  }, [user, autoGenerated]);

  useEffect(() => {
    if (authorizing) return;
    if (!authorized) {
      navigate("/entry");
    }
  }, [authorized, authorizing, navigate]);

  return <Outlet />;
};

export default AuthLayout;
