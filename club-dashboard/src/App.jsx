import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null); 
  const [importMessage, setImportMessage] = useState(""); 
  const [proposedClubs, setProposedClubs] = useState([]);

  const fetchProposedClubs = () => {
    fetch("http://localhost:4000/proposed-clubs", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setProposedClubs(data))
      .catch((err) => console.error("Failed to fetch proposed clubs:", err));
  };

  const fetchUsers = () => {
    fetch("http://localhost:4000/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to fetch users:", err));
  };

  const fetchUser = () => {
    fetch("http://localhost:4000/auth/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Failed to fetch user:", err));
  };

  useEffect(() => {
    fetchUsers();
    fetchUser();
    fetchProposedClubs();
  }, []);

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
      .then((res) => res.json())
      .then(() => fetchUsers())
      .catch((err) => console.error("Failed to delete user:", err));
  };

  const handleDeleteProposedClub = (id) => {
    fetch(`http://localhost:4000/proposed-clubs/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
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

  const handleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  const handleLogout = () => {
    fetch("http://localhost:4000/auth/logout", { credentials: "include" })
      .then(() => setUser(null))
      .catch((err) => console.error("Logout failed:", err));
  };

  return (
    <div className="container">
      <h1 className="hello-world">Hello World!</h1>
      <h2 className="title">Welcome to BCA Club Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        {user ? (
          <>
            <span>Welcome, {user.displayName}!</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button onClick={handleLogin}>Login with Google</button>
        )}
      </div>

      {user && (
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
      )}

      <h3 className="section-title">All BCA Clubs</h3>
      <ul className="club-list">
        {users.map((u) => (
          <li key={u.id} className="club-card">
            <div className="club-info">
              <span className="club-name">{u.username}</span>
              <span className="club-email">{u.email}</span>
            </div>
            {user && (
              <button className="btn-delete" onClick={() => handleDeleteUser(u.id)}>
                ✖
              </button>
            )}
          </li>
        ))}
      </ul>

      <h3 className="section-title">Proposed Clubs</h3>
      <div style={{ marginTop: "20px" }}>
        {user && (
          <button className="btn-import" onClick={handleImportResponses}>
            Import Google Form Responses
          </button>
        )}
        {importMessage && <p>{importMessage}</p>}
      </div>

      <ul className="club-list">
        {proposedClubs.map((c) => (
          <li key={c.id} className="club-card">
            <div className="club-info">
              <span className="club-name">{c.club_name}</span>
              <span className="club-email">{c.leader_email}</span>
            </div>
            {user && (
              <button
                className="btn-delete"
                onClick={() => handleDeleteProposedClub(c.id)}
              >
                ✖
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
