import { useNavigate } from "react-router-dom";
import "./Auth.css";

type AccountType = "customer" | "artist" | "planner";

const accountTypes = [
  {
    type: "customer" as AccountType,
    title: "Customer",
    description:
      "Discover events, purchase tickets, and manage your upcoming experiences.",
    icon: "🎟️",
  },
  {
    type: "artist" as AccountType,
    title: "Artist",
    description:
      "Build your artist profile and participate in events and performances.",
    icon: "🎤",
  },
  {
    type: "planner" as AccountType,
    title: "Event Planner",
    description:
      "Create events, manage venues, and organize unforgettable experiences.",
    icon: "🎪",
  },
];

function AccountTypePage() {
  const navigate = useNavigate();

  const handleSelect = (type: AccountType) => {
    navigate(`/login?role=${type}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-container account-type-container">
        <div className="auth-brand">
          <div className="brand-icon">🎟</div>
          <h1>EventMaster</h1>
          <p>Your gateway to unforgettable events</p>
        </div>

        <div className="account-type-content">
          <h2>Welcome</h2>
          <p className="auth-subtitle">
            How would you like to use EventMaster?
          </p>

          <div className="account-type-grid">
            {accountTypes.map((account) => (
              <button
                key={account.type}
                className="account-type-card"
                onClick={() => handleSelect(account.type)}
              >
                <span className="account-type-icon">{account.icon}</span>

                <div>
                  <h3>{account.title}</h3>
                  <p>{account.description}</p>
                </div>

                <span className="account-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountTypePage;