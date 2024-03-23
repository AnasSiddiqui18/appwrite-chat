import { Link, useNavigate } from "react-router-dom";
import { LogOut, LogIn } from "react-feather";
import { Store } from "../utils/Store";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await Store.handleLogout();
    navigate("/login");
  };

  return (
    <div id="header--wrapper">
      {Store.user ? (
        <>
          Welcome {Store.user.name}
          <LogOut className="header--link" onClick={handleLogout} />
        </>
      ) : (
        <>
          <Link to="/">
            <LogIn className="header--link" />
          </Link>
        </>
      )}
    </div>
  );
};

export default Header;
