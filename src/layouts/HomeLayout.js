import Footer from "components/Footer";
import Header from "components/Header";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  return (
    <div className="home page">
      <Header />
      <div className="content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
