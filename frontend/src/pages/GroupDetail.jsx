import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";
import { FaExclamationTriangle, FaCheck, FaUsers, FaGift } from "react-icons/fa";
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

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading group...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header
        className="flex-between"
        style={{
          marginBottom: "var(--spacing-2xl)",
          flexWrap: "wrap",
          gap: "var(--spacing-md)",
        }}
      >
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-ghost"
            style={{
              marginBottom: "var(--spacing-md)",
              color: "var(--color-text-inverse)",
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              color: "var(--color-text-inverse)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
            }}
          >
            {group?.name}
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {error && (
        <div className="message message-error" role="alert">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="message message-success" role="alert">
          <FaCheck />
          <span>{success}</span>
        </div>
      )}

      <div className="card">
        <div className="flex-between mb-lg">
          <h2>Participants</h2>
          <div className="flex gap-md" style={{ alignItems: "center" }}>
            <span
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.875rem",
              }}
            >
              {participants.length}{" "}
              {participants.length === 1 ? "person" : "people"}
            </span>
            <button
              onClick={() => setShowAddParticipant(!showAddParticipant)}
              className="btn btn-primary"
            >
              {showAddParticipant ? "Cancel" : "+ Add Participant"}
            </button>
          </div>
        </div>

        {showAddParticipant && (
          <form
            onSubmit={handleAddParticipant}
            className="card"
            style={{
              marginBottom: "var(--spacing-lg)",
              background: "var(--color-bg-tertiary)",
              animation: "slideDown 0.3s ease-out",
            }}
          >
            <h3 style={{ marginBottom: "var(--spacing-md)" }}>
              New Participant
            </h3>
            <div
              className="grid grid-2"
              style={{ marginBottom: "var(--spacing-md)" }}
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
                  placeholder="John Doe"
                  required
                  autoFocus
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
                  placeholder="john@example.com"
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
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaUsers style={{ fontSize: "3rem" }} />
            </div>
            <h3 style={{ marginBottom: "var(--spacing-sm)" }}>
              No participants yet
            </h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Add participants to get started with your Secret Santa exchange!
            </p>
          </div>
        ) : (
          <div className="grid grid-2">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="card"
                style={{
                  marginBottom: 0,
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="flex-between mb-md">
                  <div>
                    <h3 style={{ marginBottom: "var(--spacing-xs)" }}>
                      {participant.name}
                    </h3>
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {participant.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteParticipant(participant.id)}
                    className="btn btn-danger btn-sm"
                    aria-label={`Delete ${participant.name}`}
                  >
                    Delete
                  </button>
                </div>

                <div>
                  <div className="flex-between mb-sm">
                    <strong style={{ fontSize: "0.875rem" }}>
                      Can be assigned to:
                    </strong>
                    <button
                      onClick={() =>
                        setEditingRestrictions(
                          editingRestrictions === participant.id
                            ? null
                            : participant.id
                        )
                      }
                      className="btn btn-secondary btn-sm"
                    >
                      {editingRestrictions === participant.id
                        ? "Cancel"
                        : "Edit"}
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
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {participant.allowed_receivers.length > 0
                        ? participant.allowed_receivers.join(", ")
                        : "All other participants"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {participants.length >= 2 && (
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "var(--spacing-md)", display: "flex", justifyContent: "center" }}>
            <FaGift />
          </div>
          <h2 style={{ marginBottom: "var(--spacing-sm)" }}>
            Ready to Assign!
          </h2>
          <p
            style={{
              marginBottom: "var(--spacing-xl)",
              color: "var(--color-text-secondary)",
            }}
          >
            Create Secret Santa assignments and send emails to all participants.
            Assignments will be saved to prevent repeats in future years.
          </p>
          <button
            onClick={handleCreateAssignments}
            className="btn btn-success btn-lg"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--spacing-sm)", margin: "0 auto" }}
          >
            <FaGift /> Create Assignments & Send Emails
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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
    if (id === participant.id) return;
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
    <div style={{ marginTop: "var(--spacing-md)" }}>
      <div className="flex gap-sm mb-md">
        <button onClick={handleSelectAll} className="btn btn-secondary btn-sm">
          Select All
        </button>
        <button onClick={handleSelectNone} className="btn btn-secondary btn-sm">
          Select None
        </button>
      </div>
      <div
        className="grid grid-2"
        style={{
          marginBottom: "var(--spacing-md)",
          gap: "var(--spacing-sm)",
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
                gap: "var(--spacing-sm)",
                padding: "var(--spacing-sm)",
                background: selectedIds.has(p.id)
                  ? "var(--color-accent-light)"
                  : "var(--color-bg-secondary)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                border: `0.0625rem solid ${
                  selectedIds.has(p.id)
                    ? "var(--color-accent)"
                    : "var(--color-border-subtle)"
                }`,
                color: "var(--color-text-primary)",
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(p.id)}
                onChange={() => toggleParticipant(p.id)}
                style={{
                  cursor: "pointer",
                  width: "1rem",
                  height: "1rem",
                  accentColor: "var(--color-accent)",
                }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-primary)",
                }}
              >
                {p.name}
              </span>
            </label>
          ))}
      </div>
      <button onClick={handleSave} className="btn btn-success btn-sm">
        Save Restrictions
      </button>
      <p
        style={{
          marginTop: "var(--spacing-sm)",
          fontSize: "0.75rem",
          color: "var(--color-text-tertiary)",
        }}
      >
        If none selected, participant can be assigned to anyone (except
        themselves).
      </p>
    </div>
  );
};

export default GroupDetail;
