import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [importMessage, setImportMessage] = useState("");
  const [proposedClubs, setProposedClubs] = useState([]);
  const [club1, setClub1] = useState("");
  const [club2, setClub2] = useState("");
  const [similarity, setSimilarity] = useState(null);

  const fetchUser = () => {
    fetch("http://localhost:4000/auth/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user:", err));
  };

  const fetchUsers = () => {
    fetch("http://localhost:4000/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to fetch users:", err));
  };

  const fetchProposedClubs = () => {
    fetch("http://localhost:4000/proposed-clubs", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProposedClubs(data))
      .catch((err) => console.error("Failed to fetch proposed clubs:", err));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchProposedClubs();
    }
  }, [user]);

  const handleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  const handleLogout = () => {
    fetch("http://localhost:4000/auth/logout", { credentials: "include" })
      .then(() => setUser(null))
      .catch((err) => console.error("Logout failed:", err));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    fetch("http://localhost:4000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => {
        setUsername("");
        setEmail("");
        fetchUsers();
      })
      .catch((err) => console.error("Failed to add user:", err));
  };

  const handleDeleteUser = (id) => {
    fetch(`http://localhost:4000/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => fetchUsers())
      .catch((err) => console.error("Failed to delete user:", err));
  };

  const handleDeleteProposedClub = (id) => {
    fetch(`http://localhost:4000/proposed-clubs/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => fetchProposedClubs())
      .catch((err) => console.error("Failed to delete proposed club:", err));
  };

  const handleImportResponses = () => {
    fetch("http://localhost:4000/import-form-responses", {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        setImportMessage(data.message);
        fetchProposedClubs();
      })
      .catch(() => setImportMessage("Import failed!"));
  };

  const handleCompareClubs = async () => {
    try {
      const res = await fetch("http://localhost:4000/compare-clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club1, club2 }),
        credentials: "include",
      });
      const data = await res.json();
      setSimilarity(data.score);
    } catch (err) {
      console.error("Error comparing clubs:", err);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <h1 className="hello-world">Hello World!</h1>
        <h2 className="title">Welcome to BCA Club Dashboard</h2>
        <button className="btn-add" onClick={handleLogin}>
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="hello-world">Hello World!</h1>
      <h2 className="title">Welcome to BCA Club Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <span>Welcome, {user.displayName}!</span>
        <button className="btn-add" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <form className="form-card" onSubmit={handleAddUser}>
        <h3>Add a New Club</h3>
        <input
          className="input"
          type="text"
          placeholder="Club Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Club Leader Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn-add" type="submit">
          + Add Club
        </button>
      </form>

      <h3 className="section-title">All BCA Clubs</h3>
      <ul className="club-list">
        {users.map((u) => (
          <li key={u.id} className="club-card">
            <div className="club-info">
              <span className="club-name">{u.username}</span>
              <span className="club-email">{u.email}</span>
            </div>
            <button className="btn-delete" onClick={() => handleDeleteUser(u.id)}>
              ✖
            </button>
          </li>
        ))}
      </ul>

      <h3 className="section-title">Proposed Clubs</h3>
      {user && (
        <div style={{ marginBottom: "20px" }}>
          <button className="btn-add" onClick={handleImportResponses}>
            Import Google Form Responses
          </button>
          {importMessage && <p>{importMessage}</p>}
        </div>
      )}
      <ul className="club-list">
        {proposedClubs.map((c) => (
          <li key={c.id} className="club-card">
            <div className="club-info">
              <span className="club-name">{c.club_name}</span>
              <span className="club-email">{c.leader_email}</span>
            </div>
            <button
              className="btn-delete"
              onClick={() => handleDeleteProposedClub(c.id)}
            >
              ✖
            </button>
          </li>
        ))}
      </ul>

      <div className="form-card" style={{ textAlign: "center", marginTop: "20px" }}>
        <h3>Compare Clubs</h3>
        <input
          type="text"
          placeholder="Club Name 1"
          value={club1}
          onChange={(e) => setClub1(e.target.value)}
          className="compare-input"
        />
        <input
          type="text"
          placeholder="Club Name 2"
          value={club2}
          onChange={(e) => setClub2(e.target.value)}
          className="compare-input"
        />
        <div style={{ marginTop: "15px" }}>
          <button className="btn-add" onClick={handleCompareClubs}>
            Compare
          </button>
        </div>
        {similarity && <p className="similarity-score">Similarity Score: {similarity}</p>}
      </div>
    </div>
  );
}

export default App;
