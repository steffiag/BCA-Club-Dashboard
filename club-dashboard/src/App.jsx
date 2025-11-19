import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // READ: Fetch all users
  const fetchUsers = () => {
    fetch("http://localhost:4000/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // WRITE: Add a new user
  const handleAddUser = (e) => {
    e.preventDefault();

    fetch("http://localhost:4000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email })
    })
      .then(res => res.json())
      .then(() => {
        setUsername("");
        setEmail("");
        fetchUsers(); // refresh the list
      });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Clubs in BCA </h1>

      {/* WRITE: Add User Form */}
      <form onSubmit={handleAddUser} style={{ marginBottom: "20px" }}>
        <h3>Add New Club</h3>
        <input
          type="text"
          placeholder="Club Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="email"
          placeholder="Club Leader's Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Add User</button>
      </form>

      {/* READ: Display Users */}
      <h3>All BCA Clubs</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.username} — {u.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
