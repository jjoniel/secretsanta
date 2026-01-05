import { useTheme } from '../contexts/ThemeContext'
import { FaMoon, FaSun } from 'react-icons/fa'
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
        <FaMoon style={{ fontSize: '1.25rem' }} />
      ) : (
        <FaSun style={{ fontSize: '1.25rem' }} />
      )}
    </button>
  )
}

export default ThemeToggle

