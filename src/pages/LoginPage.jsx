import { useState } from "react";
// import { useAuth } from "../utils/Store";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { Store } from "../utils/Store";
// import { useEffect } from "react";

const LoginPage = () => {
  // const { handleUserLogin } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    console.log("name", name);
    console.log("value", value);

    setCredentials({ ...credentials, [name]: value });
    console.log("CREDS:", credentials);
  };

  const submitHandler = async (e, credentials) => {
    await Store.handleUserLogin(e, credentials);
    navigate("/");
  };

  if (Store.loading) {
    console.log("loading is true");
  } else {
    console.log("loading is false");
  }

  // const interval = setTimeout(() => {
  //   Store.loading === false;
  // }, 3000);

  // return () => clearInterval(interval);

  window.store = Store;

  return (
    <div className="auth--container">
      <div className="form--wrapper">
        <form
          onSubmit={(e) => {
            submitHandler(e, credentials);
          }}
        >
          <div className="field--wrapper">
            <label>Email:</label>
            <input
              required
              type="email"
              name="email"
              placeholder="Enter your email..."
              value={credentials.email}
              onChange={(e) => {
                handleInputChange(e);
              }}
            />
          </div>

          <div className="field--wrapper">
            <label>Password:</label>
            <input
              required
              type="password"
              name="password"
              placeholder="Enter password..."
              value={credentials.password}
              onChange={(e) => {
                handleInputChange(e);
              }}
            />
          </div>

          <div className="field--wrapper">
            <input
              type="submit"
              value="Login"
              className="btn btn--lg btn--main"
            />
          </div>
        </form>

        <p>
          Dont have an account? Register <Link to="/register">here</Link>
        </p>

        <p onClick={() => Store.setLoading(true)}>Toggle Loading</p>
      </div>
    </div>
  );
};

export default LoginPage;
