import React, { useEffect } from "react";

const Login = ({ setUserId, setLoggedIn }) => {

  useEffect(() => {
    // Check if userId already exists in localStorage
    let userId = localStorage.getItem("userId");
    if (!userId) {
      // Generate a unique User ID
      userId = "user_" + Math.floor(Math.random() * 1000000);
      localStorage.setItem("userId", userId);
    }
    setUserId(userId);
    setLoggedIn(true); // auto-login
  }, [setUserId, setLoggedIn]);

  return (
    <div>
      <p>Welcome! Your User ID has been auto-generated.</p>
    </div>
  );
};

export default Login;
