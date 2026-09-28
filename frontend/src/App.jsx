import { useState } from 'react'
import AppLayout from './AppLayout.jsx'
import ReaderScreen from './components/ReaderScreen.jsx'
import { api } from './services/api.js'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('reader')
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark',
  )
  const [idiomaDestino, setIdiomaDestino] = useState(
    () => localStorage.getItem('idiomaDestino') || 'Português',
  )

  function handleThemeToggle() {
    setIsDarkMode((currentMode) => {
      const nextMode = !currentMode
      localStorage.setItem('theme', nextMode ? 'dark' : 'light')
      return nextMode
    })
  }

  function handleLogout() {
    api.auth.logout()
    setActiveView('reader')
  }

  function handleLanguageChange(event) {
    const idioma = event.target.value
    setIdiomaDestino(idioma)
    localStorage.setItem('idiomaDestino', idioma)
  }

  const viewLabels = {
    reader: 'Leitor',
    vocabulary: 'Vocabulário',
    game: 'Revisão',
  }

  const content = activeView === 'reader' ? (
    <ReaderScreen isDarkMode={isDarkMode} idiomaDestino={idiomaDestino} />
  ) : (
    <section className="view-placeholder" aria-labelledby="view-title">
      <p className="eyebrow">Área ativa</p>
      <h1 id="view-title">{viewLabels[activeView]}</h1>
      <p>Este módulo será conectado na próxima etapa da migração.</p>
    </section>
  )

  return (
    <AppLayout
      activeView={activeView}
      isDarkMode={isDarkMode}
      onNavigate={setActiveView}
      onThemeToggle={handleThemeToggle}
      idiomaDestino={idiomaDestino}
      onLanguageChange={handleLanguageChange}
      onLogout={handleLogout}
      content={content}
    />
  )
}

export default App
