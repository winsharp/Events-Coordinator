import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState("FAN");

  const handleRegister = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      setSuccess("Registration successful. You can now sign in.");

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setError("Registration failed. Please check your information.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Sign Up</h1>

        <form onSubmit={handleRegister}>
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
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
          <div className="form-group">
            <label>Role</label>

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="FAN">Fan</option>
              <option value="ARTIST">Artist</option>
              <option value="VENUE">Venue</option>
            </select>
          </div>

          {error && <p className="register-error">{error}</p>}

          {success && <p className="register-success">{success}</p>}

          <button type="submit" className="register-button">
            Sign Up
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

export default RegisterPage;
