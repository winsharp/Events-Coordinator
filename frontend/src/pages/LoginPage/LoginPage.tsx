import { useState, type SyntheticEvent  } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      await response.json();

      navigate("/home");
    } catch (error) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign In</h1>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Sign In
          </button>
        </form>

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/home")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default LoginPage;