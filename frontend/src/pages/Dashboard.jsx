import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "../App.css";

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get("/api/groups");
      setGroups(response.data);
    } catch (err) {
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const response = await axios.post("/api/groups", { name: newGroupName });
      setGroups([...groups, response.data]);
      setNewGroupName("");
      navigate(`/groups/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await axios.delete(`/api/groups/${groupId}`);
      setGroups(groups.filter((g) => g.id !== groupId));
    } catch (err) {
      setError("Failed to delete group");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ color: "white", fontSize: "2.5rem" }}>
          🎅 Secret Santa Dashboard
        </h1>
        <button onClick={logout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="card">
        <h2>Create New Group</h2>
        <form
          onSubmit={handleCreateGroup}
          style={{ display: "flex", gap: "1rem" }}
        >
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name (e.g., 'Family 2024')"
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
            }}
            required
          />
          <button type="submit" className="btn btn-primary">
            Create Group
          </button>
        </form>
        {error && (
          <div className="error" style={{ marginTop: "1rem" }}>
            {error}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "1.5rem" }}>Your Groups</h2>
        {groups.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "2rem" }}>
            No groups yet. Create one to get started!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {groups.map((group) => (
              <div
                key={group.id}
                style={{
                  padding: "1.5rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>{group.name}</h3>
                  <p style={{ color: "#666", fontSize: "0.875rem" }}>
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="btn btn-primary"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
