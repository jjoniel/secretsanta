import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import '../App.css'

const Dashboard = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [newGroupName, setNewGroupName] = useState('')
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups')
      setGroups(response.data)
    } catch (err) {
      setError('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) return

    try {
      const response = await axios.post('/api/groups', { name: newGroupName })
      setGroups([...groups, response.data])
      setNewGroupName('')
      navigate(`/groups/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create group')
    }
  }

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return

    try {
      await axios.delete(`/api/groups/${groupId}`)
      setGroups(groups.filter((g) => g.id !== groupId))
    } catch (err) {
      setError('Failed to delete group')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading your groups...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <header
        className="flex-between"
        style={{
          marginBottom: 'var(--spacing-2xl)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
        }}
      >
        <div>
          <h1
            style={{
              color: 'var(--color-text-inverse)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            🎅 Secret Santa
          </h1>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9375rem',
            }}
          >
            Manage your gift exchanges
          </p>
        </div>
        <div className="flex gap-md">
          <ThemeToggle />
          <button onClick={logout} className="btn btn-ghost" style={{ color: 'var(--color-text-inverse)' }}>
            Sign Out
          </button>
        </div>
      </header>

      {error && (
        <div className="message message-error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Create New Group</h2>
        <form onSubmit={handleCreateGroup} className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name (e.g., 'Family 2024')"
            style={{
              flex: '1 1 20rem',
              padding: 'var(--spacing-md)',
              border: '0.0625rem solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
            }}
            required
          />
          <button type="submit" className="btn btn-primary">
            Create Group
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex-between mb-lg">
          <h2>Your Groups</h2>
          {groups.length > 0 && (
            <span
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
              }}
            >
              {groups.length} {groups.length === 1 ? 'group' : 'groups'}
            </span>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No groups yet</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Create your first Secret Santa group to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-2">
            {groups.map((group, index) => (
              <div
                key={group.id}
                className="card"
                style={{
                  marginBottom: 0,
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                }}
                onClick={() => navigate(`/groups/${group.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-0.25rem)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ margin: 0 }}>{group.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteGroup(group.id)
                    }}
                    className="btn btn-danger btn-sm"
                    aria-label={`Delete ${group.name}`}
                  >
                    Delete
                  </button>
                </div>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: 'var(--spacing-md)',
                  }}
                >
                  Created {new Date(group.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/groups/${group.id}`)
                  }}
                >
                  Open Group
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  )
}

export default Dashboard
