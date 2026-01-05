import { useTheme } from '../contexts/ThemeContext'
import '../App.css'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        padding: '0.5rem',
        borderRadius: 'var(--radius-full)',
        minWidth: '2.5rem',
        height: '2.5rem',
      }}
    >
      {theme === 'light' ? (
        <span style={{ fontSize: '1.25rem' }}>🌙</span>
      ) : (
        <span style={{ fontSize: '1.25rem' }}>☀️</span>
      )}
    </button>
  )
}

export default ThemeToggle

