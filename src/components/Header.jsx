import { Link, useNavigate } from "react-router-dom";
import { LogOut, LogIn } from "react-feather";
import { Store } from "../lib/utils/Store";
import PropTypes from "prop-types";

// import { useSnapshot } from "valtio";
import React from "react";

const Header = React.memo(function Header({ state }) {
  const navigate = useNavigate();

  const LogoutHandler = async () => {
    try {
      console.log("log out working");
      await Store.handleLogout();
      navigate("/login");
    } catch (error) {
      console.log(`error while logging out`, error);
    }
  };

  return (
    <div id="header--wrapper">
      {Store.user ? (
        <>
          {state}
          <LogOut className="header--link" onClick={LogoutHandler} />
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
});

Header.propTypes = {
  state: PropTypes.string,
};

export default Header;
