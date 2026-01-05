import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  FaSnowflake,
  FaExclamationTriangle,
  FaBox,
  FaCheck,
  FaUsers,
  FaGift,
} from "react-icons/fa";
import "../App.css";

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [participantsByGroup, setParticipantsByGroup] = useState({});
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddParticipant, setShowAddParticipant] = useState({});
  const [newParticipants, setNewParticipants] = useState({});
  const [editingRestrictions, setEditingRestrictions] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get("/api/groups");
      const groupsData = response.data;
      setGroups(groupsData);
      
      // Fetch participants for all groups
      const participantsPromises = groupsData.map((group) =>
        axios.get(`/api/groups/${group.id}/participants`).then((res) => ({
          groupId: group.id,
          participants: res.data,
        }))
      );
      const participantsResults = await Promise.all(participantsPromises);
      const participantsMap = {};
      participantsResults.forEach(({ groupId, participants }) => {
        participantsMap[groupId] = participants;
      });
      setParticipantsByGroup(participantsMap);
    } catch (err) {
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (groupId) => {
    try {
      const response = await axios.get(`/api/groups/${groupId}/participants`);
      setParticipantsByGroup({
        ...participantsByGroup,
        [groupId]: response.data,
      });
    } catch (err) {
      setError("Failed to load participants");
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const response = await axios.post("/api/groups", { name: newGroupName });
      setGroups([...groups, response.data]);
      setParticipantsByGroup({
        ...participantsByGroup,
        [response.data.id]: [],
      });
      setNewGroupName("");
      setSuccess("Group created successfully");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await axios.delete(`/api/groups/${groupId}`);
      setGroups(groups.filter((g) => g.id !== groupId));
      const newParticipants = { ...participantsByGroup };
      delete newParticipants[groupId];
      setParticipantsByGroup(newParticipants);
      setSuccess("Group deleted");
    } catch (err) {
      setError("Failed to delete group");
    }
  };

  const handleAddParticipant = async (groupId, e) => {
    e.preventDefault();
    const participant = newParticipants[groupId];
    if (!participant || !participant.name || !participant.email) return;

    try {
      await axios.post(`/api/groups/${groupId}/participants`, participant);
      setNewParticipants({
        ...newParticipants,
        [groupId]: { name: "", email: "" },
      });
      setShowAddParticipant({ ...showAddParticipant, [groupId]: false });
      setSuccess("Participant added successfully");
      fetchParticipants(groupId);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add participant");
    }
  };

  const handleDeleteParticipant = async (groupId, participantId) => {
    if (!window.confirm("Are you sure you want to delete this participant?"))
      return;
    try {
      await axios.delete(`/api/groups/${groupId}/participants/${participantId}`);
      setSuccess("Participant deleted");
      fetchParticipants(groupId);
    } catch (err) {
      setError("Failed to delete participant");
    }
  };

  const handleUpdateRestrictions = async (
    groupId,
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
      fetchParticipants(groupId);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update restrictions");
    }
  };

  const handleCreateAssignments = async (groupId) => {
    const participants = participantsByGroup[groupId] || [];
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
        <p>Loading your groups...</p>
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
          <h1
            style={{
              color: "var(--color-text-inverse)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              marginBottom: "var(--spacing-xs)",
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
            }}
          >
            <FaSnowflake style={{ color: "var(--color-accent)" }} /> Secret Santa
          </h1>
          <p
            style={{
              color: "var(--color-text-inverse)",
              opacity: 0.9,
              fontSize: "0.9375rem",
            }}
          >
            Manage your gift exchanges
          </p>
        </div>
        <div className="flex gap-md">
          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{ color: "var(--color-text-inverse)" }}
          >
            Sign Out
          </button>
        </div>
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
        <h2 style={{ marginBottom: "var(--spacing-lg)", color: "#ffffff" }}>
          Create New Group
        </h2>
        <form
          onSubmit={handleCreateGroup}
          className="flex gap-md"
          style={{ flexWrap: "wrap" }}
        >
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name (e.g., 'Family 2024')"
            style={{
              flex: "1 1 20rem",
              padding: "var(--spacing-md)",
              border: "0.0625rem solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "1rem",
              fontFamily: "inherit",
              background: "var(--color-bg-primary)",
              color: "var(--color-text-primary)",
            }}
            required
          />
          <button type="submit" className="btn btn-primary">
            Create Group
          </button>
        </form>
      </div>

      {groups.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaBox style={{ fontSize: "3rem" }} />
            </div>
            <h3 style={{ marginBottom: "var(--spacing-sm)", color: "#ffffff" }}>
              No groups yet
            </h3>
            <p style={{ color: "#ffffff" }}>
              Create your first Secret Santa group to get started!
            </p>
          </div>
        </div>
      ) : (
        groups.map((group, groupIndex) => {
          const participants = participantsByGroup[group.id] || [];
          const showAdd = showAddParticipant[group.id];
          const newParticipant = newParticipants[group.id] || { name: "", email: "" };

          return (
            <div key={group.id} className="card" style={{ marginBottom: "var(--spacing-xl)" }}>
              <div className="flex-between mb-lg">
                <div>
                  <h2 style={{ color: "#ffffff", marginBottom: "var(--spacing-xs)" }}>
                    {group.name}
                  </h2>
                  <p
                    style={{
                      color: "#ffffff",
                      fontSize: "0.875rem",
                      opacity: 0.8,
                    }}
                  >
                    Created{" "}
                    {new Date(group.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="btn btn-danger btn-sm"
                  aria-label={`Delete ${group.name}`}
                >
                  Delete Group
                </button>
              </div>

              <div style={{ marginBottom: "var(--spacing-xl)" }}>
                <div className="flex-between mb-lg">
                  <h3 style={{ color: "#ffffff" }}>Participants</h3>
                  <div className="flex gap-md" style={{ alignItems: "center" }}>
                    <span
                      style={{
                        color: "#ffffff",
                        fontSize: "0.875rem",
                      }}
                    >
                      {participants.length}{" "}
                      {participants.length === 1 ? "person" : "people"}
                    </span>
                    <button
                      onClick={() =>
                        setShowAddParticipant({
                          ...showAddParticipant,
                          [group.id]: !showAdd,
                        })
                      }
                      className="btn btn-primary"
                    >
                      {showAdd ? "Cancel" : "+ Add Participant"}
                    </button>
                  </div>
                </div>

                {showAdd && (
                  <form
                    onSubmit={(e) => handleAddParticipant(group.id, e)}
                    className="card"
                    style={{
                      marginBottom: "var(--spacing-lg)",
                      background: "var(--color-bg-tertiary)",
                      animation: "slideDown 0.3s ease-out",
                    }}
                  >
                    <h4 style={{ marginBottom: "var(--spacing-md)", color: "#ffffff" }}>
                      New Participant
                    </h4>
                    <div
                      className="grid grid-2"
                      style={{ marginBottom: "var(--spacing-md)" }}
                    >
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ color: "#ffffff" }}>Name</label>
                        <input
                          type="text"
                          value={newParticipant.name}
                          onChange={(e) =>
                            setNewParticipants({
                              ...newParticipants,
                              [group.id]: {
                                ...newParticipant,
                                name: e.target.value,
                              },
                            })
                          }
                          placeholder="John Doe"
                          required
                          autoFocus
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ color: "#ffffff" }}>Email</label>
                        <input
                          type="email"
                          value={newParticipant.email}
                          onChange={(e) =>
                            setNewParticipants({
                              ...newParticipants,
                              [group.id]: {
                                ...newParticipant,
                                email: e.target.value,
                              },
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
                    <h4 style={{ marginBottom: "var(--spacing-sm)", color: "#ffffff" }}>
                      No participants yet
                    </h4>
                    <p style={{ color: "#ffffff" }}>
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
                            <h4 style={{ marginBottom: "var(--spacing-xs)", color: "#ffffff" }}>
                              {participant.name}
                            </h4>
                            <p
                              style={{
                                color: "#ffffff",
                                fontSize: "0.875rem",
                                opacity: 0.8,
                              }}
                            >
                              {participant.email}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteParticipant(group.id, participant.id)
                            }
                            className="btn btn-danger btn-sm"
                            aria-label={`Delete ${participant.name}`}
                          >
                            Delete
                          </button>
                        </div>

                        <div>
                          <div className="flex-between mb-sm">
                            <strong style={{ fontSize: "0.875rem", color: "#ffffff" }}>
                              Can be assigned to:
                            </strong>
                            <button
                              onClick={() =>
                                setEditingRestrictions(
                                  editingRestrictions === `${group.id}-${participant.id}`
                                    ? null
                                    : `${group.id}-${participant.id}`
                                )
                              }
                              className="btn btn-secondary btn-sm"
                            >
                              {editingRestrictions === `${group.id}-${participant.id}`
                                ? "Cancel"
                                : "Edit"}
                            </button>
                          </div>

                          {editingRestrictions === `${group.id}-${participant.id}` ? (
                            <RestrictionEditor
                              participant={participant}
                              allParticipants={participants}
                              onSave={(allowedIds) =>
                                handleUpdateRestrictions(
                                  group.id,
                                  participant.id,
                                  allowedIds
                                )
                              }
                            />
                          ) : (
                            <p
                              style={{
                                color: "#ffffff",
                                fontSize: "0.8125rem",
                                opacity: 0.8,
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
                <div
                  className="card"
                  style={{
                    textAlign: "center",
                    background: "var(--color-bg-tertiary)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "3rem",
                      marginBottom: "var(--spacing-md)",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <FaGift style={{ color: "var(--color-accent)" }} />
                  </div>
                  <h3 style={{ marginBottom: "var(--spacing-sm)", color: "#ffffff" }}>
                    Ready to Assign!
                  </h3>
                  <p
                    style={{
                      marginBottom: "var(--spacing-xl)",
                      color: "#ffffff",
                      opacity: 0.8,
                    }}
                  >
                    Create Secret Santa assignments and send emails to all participants.
                    Assignments will be saved to prevent repeats in future years.
                  </p>
                  <button
                    onClick={() => handleCreateAssignments(group.id)}
                    className="btn btn-success btn-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "var(--spacing-sm)",
                      margin: "0 auto",
                    }}
                  >
                    <FaGift /> Create Assignments & Send Emails
                  </button>
                </div>
              )}
            </div>
          );
        })
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
                color: "#ffffff",
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
                  color: "#ffffff",
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
          color: "#ffffff",
          opacity: 0.7,
        }}
      >
        If none selected, participant can be assigned to anyone (except
        themselves).
      </p>
    </div>
  );
};

export default Dashboard;
