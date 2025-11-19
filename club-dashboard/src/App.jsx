import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // READ: Fetch all clubs
  const fetchUsers = () => {
    fetch("http://localhost:4000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // WRITE: Add new club
  const handleAddUser = (e) => {
    e.preventDefault();

    fetch("http://localhost:4000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    })
      .then((res) => res.json())
      .then(() => {
        setUsername("");
        setEmail("");
        fetchUsers();
      });
  };

  // DELETE: Remove club
  const handleDelete = (id) => {
    fetch(`http://localhost:4000/users/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => fetchUsers());
  };

  return (
    <div className="container">
      <h1 className="hello-world">Hello World!</h1>
      <h2 className="title">- Welcome to BCACD's Plumbing Project - </h2>

      {/* Add Club Form */}
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

      {/* Display Clubs */}
      <h3 className="section-title">All BCA Clubs</h3>

      <ul className="club-list">
        {users.map((u) => (
          <li key={u.id} className="club-card">
            <div className="club-info">
              <span className="club-name">{u.username}</span>
              <span className="club-email">{u.email}</span>
            </div>
            <button className="btn-delete" onClick={() => handleDelete(u.id)}>
              ✖
            </button> 
          </li>
        ))}
      </ul>
    </div>
  ); 
}

export default App;
