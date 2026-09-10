import type { FormEvent } from "react";
import { useState } from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./Auth.css";

import { login } from "../../api/auth";
import type { BackendRole } from "../../api/auth";

type AccountType =
  | "customer"
  | "artist"
  | "planner";

const roleNames: Record<AccountType, string> = {
  customer: "Customer",
  artist: "Artist",
  planner: "Event Planner",
};

function isAccountType(
  value: string | null
): value is AccountType {
  return (
    value === "customer" ||
    value === "artist" ||
    value === "planner"
  );
}

function getBackendRole(
  role: AccountType
): BackendRole {
  switch (role) {
    case "customer":
      return "CUSTOMER";

    case "artist":
      return "ARTIST";

    case "planner":
      return "VENUE";

    default:
      return "CUSTOMER";
  }
}

function getDashboardPath(
  role: BackendRole
): string {
  switch (role) {
    case "VENUE":
      return "/venue/dashboard";

    case "CUSTOMER":
      return "/home";

    case "ARTIST":
      return "/home";

    default:
      return "/home";
  }
}

function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawRole = searchParams.get("role");

  const role: AccountType = isAccountType(rawRole)
    ? rawRole
    : "customer";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError(
        "Please enter your username and password."
      );
      return;
    }

    try {
      setLoading(true);

      const account = await login(
        username.trim(),
        password
      );

      const expectedRole = getBackendRole(role);

      if (account.role !== expectedRole) {
        setError(
          `This account is registered as ${account.role.toLowerCase()}, not ${roleNames[
    role
    ].toLowerCase()}.`
        );

        return;
      }

      navigate(getDashboardPath(account.role));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to sign in. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <div className="brand-icon">🎟</div>

          <h1>EventMaster</h1>

          <p>
            Sign in to manage your events and tickets
          </p>
        </div>

        <div className="auth-form-container">

          <div className="role-badge">
            {roleNames[role]}
          </div>

          <h2>Sign in</h2>

          <p className="auth-subtitle">
            Enter your account information below.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                placeholder="Enter your username"
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  placeholder="Enter your password"
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>
            </div>

            <div className="login-options">

              <label className="remember-me">
                <input
                  type="checkbox"
                  disabled
                />

                <span>
                  Remember me
                </span>
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  alert(
                    "Password reset will be implemented later."
                  )
                }
              >
                Forgot password?
              </button>

            </div>

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          <div className="auth-divider">
            <span>
              New to EventMaster?
            </span>
          </div>

          <Link
            to={`/register?role=${role}`}
            className="auth-secondary-button"
          >
            Create an account
          </Link>

          <Link
            to="/"
            className="change-role-link"
          >
            ← Change account type
          </Link>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
