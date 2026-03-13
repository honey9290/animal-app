import React, { useState, useEffect } from "react";

// ── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#f0f4ff",
  white: "#ffffff",
  card: "#ffffff",
  border: "#e2e8f0",
  primary: "#4f46e5",
  primaryHover: "#4338ca",
  primaryLight: "#eef2ff",
  success: "#059669",
  successBg: "#d1fae5",
  error: "#dc2626",
  errorBg: "#fee2e2",
  text: "#1e293b",
  muted: "#64748b",
  subtle: "#94a3b8",
};

// ── API helper ───────────────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:4000${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Something went wrong");
  return json;
}

// ── Animal emoji map ─────────────────────────────────────────────────────────
function getAnimalEmoji(name) {
  const map = {
    Bear: "🐻", Wolf: "🐺", Fox: "🦊", Lion: "🦁", Tiger: "🐯", Elephant: "🐘",
    Penguin: "🐧", Dolphin: "🐬", Eagle: "🦅", Owl: "🦉", Panda: "🐼",
    Koala: "🐨", Kangaroo: "🦘", Crocodile: "🐊", Flamingo: "🦩", Peacock: "🦚",
    Unicorn: "🦄", Dragon: "🐉", Shark: "🦈", Octopus: "🐙", Turtle: "🐢",
    Parrot: "🦜", Gorilla: "🦍", Zebra: "🦓", Giraffe: "🦒", Hippo: "🦛",
    Rhino: "🦏", Camel: "🐪", Llama: "🦙", Alpaca: "🦙", Deer: "🦌",
    Bat: "🦇", Butterfly: "🦋", Snail: "🐌", Bee: "🐝", Ladybug: "🐞",
    Crab: "🦀", Lobster: "🦞", Shrimp: "🦐", Squid: "🦑", Jellyfish: "🪼",
    Hedgehog: "🦔", Sloth: "🦥", Otter: "🦦", Skunk: "🦨", Raccoon: "🦝",
    Porcupine: "🦔", Moose: "🫎", Bison: "🦬", Mammoth: "🦣",
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (name.includes(key)) return emoji;
  }
  return "🐾"; // default
}

// ── Shared UI components ─────────────────────────────────────────────────────
const Input = ({ label, type = "text", value, onChange, placeholder, error }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "10px 14px", fontSize: 14,
        border: `1.5px solid ${error ? C.error : C.border}`,
        borderRadius: 8, outline: "none", background: C.white,
        color: C.text, boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
    />
    {error && <div style={{ fontSize: 12, color: C.error, marginTop: 4 }}>{error}</div>}
  </div>
);

const Button = ({ children, onClick, disabled, variant = "primary", fullWidth }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: fullWidth ? "100%" : "auto",
      padding: "11px 24px", fontSize: 14, fontWeight: 700,
      borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      background: variant === "primary" ? (disabled ? C.subtle : C.primary) : C.white,
      color: variant === "primary" ? "#fff" : C.primary,
      border: variant === "outline" ? `2px solid ${C.primary}` : "none",
      opacity: disabled ? 0.7 : 1,
      transition: "all 0.15s",
    }}
    onMouseEnter={e => { if (!disabled) e.target.style.background = variant === "primary" ? C.primaryHover : C.primaryLight; }}
    onMouseLeave={e => { if (!disabled) e.target.style.background = variant === "primary" ? C.primary : C.white; }}
  >
    {children}
  </button>
);

const Alert = ({ type, message }) => (
  <div style={{
    padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 16,
    background: type === "error" ? C.errorBg : C.successBg,
    color: type === "error" ? C.error : C.success,
    border: `1px solid ${type === "error" ? "#fca5a5" : "#6ee7b7"}`,
  }}>
    {type === "error" ? "⚠️" : "✅"} {message}
  </div>
);

const Card = ({ children, style }) => (
  <div style={{
    background: C.white, borderRadius: 16, padding: "32px 36px",
    boxShadow: "0 4px 24px rgba(79,70,229,0.08)", border: `1px solid ${C.border}`,
    ...style,
  }}>
    {children}
  </div>
);

// ── REGISTER PAGE ────────────────────────────────────────────────────────────
function RegisterPage({ onSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (username.length < 3) errs.username = "Must be at least 3 characters";
    if (password.length < 6) errs.password = "Must be at least 6 characters";
    if (password !== confirm) errs.confirm = "Passwords do not match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api("/api/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("token", data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🐾</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>Create Account</h1>
          <p style={{ fontSize: 14, color: C.muted }}>Sign up to discover your animal name!</p>
        </div>

        {error && <Alert type="error" message={error} />}

        <Input
          label="Username"
          value={username}
          onChange={e => { setUsername(e.target.value); setFieldErrors(f => ({ ...f, username: "" })); }}
          placeholder="Choose a username..."
          error={fieldErrors.username}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: "" })); }}
          placeholder="At least 6 characters..."
          error={fieldErrors.password}
        />
        <Input
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={e => { setConfirm(e.target.value); setFieldErrors(f => ({ ...f, confirm: "" })); }}
          placeholder="Repeat your password..."
          error={fieldErrors.confirm}
        />

        <Button fullWidth onClick={handleRegister} disabled={loading}>
          {loading ? "Creating Account..." : "🚀 Create Account"}
        </Button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.muted }}>
          Already have an account?{" "}
          <span
            onClick={onSwitchToLogin}
            style={{ color: C.primary, fontWeight: 700, cursor: "pointer" }}
          >
            Log In
          </span>
        </p>
      </Card>
    </div>
  );
}

// ── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!username || !password) { setError("Please fill in both fields"); return; }
    setLoading(true);
    try {
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("token", data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>Welcome Back</h1>
          <p style={{ fontSize: 14, color: C.muted }}>Log in to see your animal name</p>
        </div>

        {error && <Alert type="error" message={error} />}

        <Input
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter your username..."
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password..."
          error={null}
        />
        <div onKeyDown={handleKeyDown}>
          <Button fullWidth onClick={handleLogin} disabled={loading}>
            {loading ? "Logging In..." : "🔑 Log In"}
          </Button>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.muted }}>
          New here?{" "}
          <span
            onClick={onSwitchToRegister}
            style={{ color: C.primary, fontWeight: 700, cursor: "pointer" }}
          >
            Create Account
          </span>
        </p>
      </Card>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout, onViewUsers }) {
  const emoji = getAnimalEmoji(user.animalName);
  const colors = ["#fef3c7", "#d1fae5", "#dbeafe", "#fce7f3", "#ede9fe", "#fee2e2"];
  const bgColor = colors[user.animalName.charCodeAt(0) % colors.length];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>
            👋 Hello, <strong style={{ color: C.text }}>{user.username}</strong>
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" onClick={onViewUsers}>👥 All Users</Button>
            <Button variant="outline" onClick={onLogout}>Log Out</Button>
          </div>
        </div>

        {/* Animal card */}
        <Card>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Your Unique Animal Name
          </p>

          <div style={{
            width: 140, height: 140, borderRadius: "50%",
            background: bgColor, margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 72, boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}>
            {emoji}
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 900, color: C.primary, marginBottom: 8, letterSpacing: "-0.02em" }}>
            {user.animalName}
          </h2>

          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
            This animal name is <strong>uniquely yours</strong>.<br />
            No other user in the system has this name.
          </p>

          <div style={{
            marginTop: 24, padding: "12px 20px",
            background: C.primaryLight, borderRadius: 10,
            fontSize: 13, color: C.primary, fontWeight: 600,
          }}>
            🎉 Welcome to the Animal Name Club!
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── ALL USERS PAGE (Admin view) ───────────────────────────────────────────────
function AllUsersPage({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api("/api/users");
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.animalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "24px 20px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text }}>👥 All Users</h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
              {users.length} registered user{users.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" onClick={onBack}>← Back</Button>
        </div>

        {/* Note about passwords */}
        <div style={{
          background: "#fffbeb", border: "1px solid #fcd34d",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          fontSize: 13, color: "#92400e", fontWeight: 500,
        }}>
          🔒 <strong>Note:</strong> Passwords are stored as secure hashes in MongoDB — they are never stored as plain text and cannot be reversed. To view users directly in the database, see the README for MongoDB Compass instructions.
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by username or animal name..."
          style={{
            width: "100%", padding: "10px 14px", fontSize: 14,
            border: `1.5px solid ${C.border}`, borderRadius: 8,
            outline: "none", marginBottom: 16, boxSizing: "border-box",
            background: C.white, color: C.text,
          }}
        />

        {/* Content */}
        {loading && (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: C.muted }}>Loading users...</p>
          </Card>
        )}

        {error && <Alert type="error" message={error} />}

        {!loading && filtered.length === 0 && (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: C.muted }}>No users found.</p>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.primaryLight }}>
                  {["#", "Username", "Animal Name", "Joined"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "12px 16px",
                      fontSize: 12, fontWeight: 700, color: C.primary,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u._id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : "#fafbff" }}>
                    <td style={{ padding: "12px 16px", color: C.subtle, fontSize: 13 }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{u.username}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 18, marginRight: 6 }}>{getAnimalEmoji(u.animalName)}</span>
                      <span style={{ fontWeight: 600, color: C.primary, fontSize: 14 }}>{u.animalName}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: C.muted, fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // page can be: "login" | "register" | "dashboard" | "users"
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  // On app load, check if a token exists and restore session
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    api("/api/me")
      .then(data => { setUser(data.user); setPage("dashboard"); })
      .catch(() => { localStorage.removeItem("token"); });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPage("login");
  };

  if (page === "register") {
    return (
      <RegisterPage
        onSuccess={u => { setUser(u); setPage("dashboard"); }}
        onSwitchToLogin={() => setPage("login")}
      />
    );
  }

  if (page === "login") {
    return (
      <LoginPage
        onSuccess={u => { setUser(u); setPage("dashboard"); }}
        onSwitchToRegister={() => setPage("register")}
      />
    );
  }

  if (page === "users") {
    return <AllUsersPage onBack={() => setPage("dashboard")} />;
  }

  if (page === "dashboard" && user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onViewUsers={() => setPage("users")}
      />
    );
  }

  return null;
}
