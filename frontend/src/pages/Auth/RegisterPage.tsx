
import { FormEvent, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./Auth.css";

import { register } from "../../api/auth";
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

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawRole = searchParams.get("role");

  const role: AccountType = isAccountType(rawRole)
    ? rawRole
    : "customer";

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (
      !username.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        role: getBackendRole(role),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      navigate(`/login?role=${role}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to create your account. Please try again."
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
            Create your account and start exploring
            events.
          </p>
        </div>

        <div className="auth-form-container">

          <div className="role-badge">
            {roleNames[role]}
          </div>

          <h2>Create account</h2>

          <p className="auth-subtitle">
            Enter your information below to get started.
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
                placeholder="Choose a username"
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="firstName">
                  First name
                </label>

                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  placeholder="First name"
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="given-name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Last name
                </label>

                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  placeholder="Last name"
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="family-name"
                />
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={loading}
                autoComplete="email"
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
                  placeholder="Create a password"
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  autoComplete="new-password"
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

              <small className="password-hint">
                Password must be at least 8 characters.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="password-wrapper">

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  placeholder="Confirm your password"
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          <div className="auth-divider">
            <span>
              Already have an account?
            </span>
          </div>

          <Link
            to={`/login?role=${role}`}
            className="auth-secondary-button"
          >
            Sign in
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

export default RegisterPage;





