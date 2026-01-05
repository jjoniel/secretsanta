import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: "", email: "" });
  const [editingRestrictions, setEditingRestrictions] = useState(null);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      const [groupRes, participantsRes] = await Promise.all([
        axios.get(`/api/groups/${groupId}`),
        axios.get(`/api/groups/${groupId}/participants`),
      ]);
      setGroup(groupRes.data);
      setParticipants(participantsRes.data);
    } catch (err) {
      setError("Failed to load group data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/groups/${groupId}/participants`, newParticipant);
      setNewParticipant({ name: "", email: "" });
      setShowAddParticipant(false);
      setSuccess("Participant added successfully");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add participant");
    }
  };

  const handleDeleteParticipant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this participant?"))
      return;
    try {
      await axios.delete(`/api/groups/${groupId}/participants/${id}`);
      setSuccess("Participant deleted");
      fetchData();
    } catch (err) {
      setError("Failed to delete participant");
    }
  };

  const handleUpdateRestrictions = async (
    participantId,
    allowedReceiverIds
  ) => {
    try {
      await axios.put(
        `/api/groups/${groupId}/participants/${participantId}/restrictions`,
        {
          giver_id: participantId,
          allowed_receiver_ids: allowedReceiverIds,
        }
      );
      setEditingRestrictions(null);
      setSuccess("Restrictions updated");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update restrictions");
    }
  };

  const handleCreateAssignments = async () => {
    if (participants.length < 2) {
      setError("Need at least 2 participants");
      return;
    }

    if (
      !window.confirm(
        "Create assignments and send emails? This will be saved to history."
      )
    )
      return;

    try {
      const response = await axios.post(
        `/api/groups/${groupId}/assignments`,
        {
          group_id: parseInt(groupId),
          year: new Date().getFullYear(),
        },
        {
          params: { send_emails: true },
        }
      );
      setSuccess(
        response.data.message || "Assignments created and emails sent!"
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create assignments");
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
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary"
            style={{ marginBottom: "1rem" }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ color: "white", fontSize: "2.5rem" }}>{group?.name}</h1>
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{ background: "#fee", border: "2px solid #dc3545" }}
        >
          <div className="error">{error}</div>
        </div>
      )}
      {success && (
        <div
          className="card"
          style={{ background: "#efe", border: "2px solid #28a745" }}
        >
          <div className="success">{success}</div>
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2>Participants ({participants.length})</h2>
          <button
            onClick={() => setShowAddParticipant(!showAddParticipant)}
            className="btn btn-primary"
          >
            {showAddParticipant ? "Cancel" : "+ Add Participant"}
          </button>
        </div>

        {showAddParticipant && (
          <form
            onSubmit={handleAddParticipant}
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              background: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Name</label>
                <input
                  type="text"
                  value={newParticipant.name}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Email</label>
                <input
                  type="email"
                  value={newParticipant.email}
                  onChange={(e) =>
                    setNewParticipant({
                      ...newParticipant,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">
              Add Participant
            </button>
          </form>
        )}

        {participants.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: "2rem" }}>
            No participants yet. Add some to get started!
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {participants.map((participant) => (
              <div
                key={participant.id}
                style={{
                  padding: "1.5rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h3 style={{ marginBottom: "0.5rem" }}>
                      {participant.name}
                    </h3>
                    <p style={{ color: "#666", fontSize: "0.875rem" }}>
                      {participant.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteParticipant(participant.id)}
                    className="btn btn-danger"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                  >
                    Delete
                  </button>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong>Can be assigned to:</strong>
                    <button
                      onClick={() =>
                        setEditingRestrictions(
                          editingRestrictions === participant.id
                            ? null
                            : participant.id
                        )
                      }
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                      {editingRestrictions === participant.id
                        ? "Cancel"
                        : "Edit Restrictions"}
                    </button>
                  </div>

                  {editingRestrictions === participant.id ? (
                    <RestrictionEditor
                      participant={participant}
                      allParticipants={participants}
                      onSave={(allowedIds) =>
                        handleUpdateRestrictions(participant.id, allowedIds)
                      }
                    />
                  ) : (
                    <div style={{ color: "#666", fontSize: "0.875rem" }}>
                      {participant.allowed_receivers.length > 0
                        ? participant.allowed_receivers.join(", ")
                        : "All other participants (no restrictions)"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {participants.length >= 2 && (
        <div className="card">
          <h2 style={{ marginBottom: "1rem" }}>Create Assignments</h2>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>
            This will create Secret Santa assignments for all participants and
            send emails. Assignments will be saved to history to prevent repeats
            in future years.
          </p>
          <button
            onClick={handleCreateAssignments}
            className="btn btn-success"
            style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}
          >
            🎁 Create Assignments & Send Emails
          </button>
        </div>
      )}
    </div>
  );
};

const RestrictionEditor = ({ participant, allParticipants, onSave }) => {
  const [selectedIds, setSelectedIds] = useState(
    new Set(
      participant.allowed_receivers
        .map((name) => {
          const p = allParticipants.find((ap) => ap.name === name);
          return p ? p.id : null;
        })
        .filter(Boolean)
    )
  );

  const toggleParticipant = (id) => {
    if (id === participant.id) return; // Can't assign to self
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSave = () => {
    onSave(Array.from(selectedIds));
  };

  const handleSelectAll = () => {
    const allOtherIds = allParticipants
      .filter((p) => p.id !== participant.id)
      .map((p) => p.id);
    setSelectedIds(new Set(allOtherIds));
  };

  const handleSelectNone = () => {
    setSelectedIds(new Set());
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={handleSelectAll}
          className="btn btn-secondary"
          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          Select All
        </button>
        <button
          onClick={handleSelectNone}
          className="btn btn-secondary"
          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          Select None
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {allParticipants
          .filter((p) => p.id !== participant.id)
          .map((p) => (
            <label
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem",
                background: selectedIds.has(p.id) ? "#e7f3ff" : "#f5f5f5",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(p.id)}
                onChange={() => toggleParticipant(p.id)}
              />
              {p.name}
            </label>
          ))}
      </div>
      <button
        onClick={handleSave}
        className="btn btn-success"
        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
      >
        Save Restrictions
      </button>
      <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#666" }}>
        If no restrictions are set, participant can be assigned to anyone
        (except themselves).
      </p>
    </div>
  );
};

export default GroupDetail;
