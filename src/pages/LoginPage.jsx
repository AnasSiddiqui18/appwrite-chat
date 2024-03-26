import { useState } from "react";
// import { useAuth } from "../utils/Store";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";
import { Store } from "../lib/utils/Store";
import { useSnapshot } from "valtio";
// import { useEffect } from "react";

const LoginPage = () => {
  // const { handleUserLogin } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const State = useSnapshot(Store);

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

  // if (State.loading) {
  //   console.log("state true");
  //   return <div>Login Loading...</div>;
  // } else {
  //   console.log("state false");
  // }

  // useEffect(() => {
  //   const interval = setTimeout(() => {
  //     Store.loading = false;
  //   }, 1500);

  //   return () => clearInterval(interval);
  // }, [State]);

  return (
    <div className="auth--container flex flex-col">
      {State.loading ? <div> Logging... </div> : null}

      <div className="form--wrapper border-2">
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
              style={{ backgroundColor: "#ffa800", color: "black" }}
            />
          </div>
        </form>

        <p>
          Dont have an account? Register <Link to="/register">here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
