function AppLayout({
  activeView,
  isDarkMode,
  onNavigate,
  onThemeToggle,
  onLogout,
  idiomaDestino,
  onLanguageChange,
  content,
}) {
  const navigationItems = [
    { id: 'reader', label: 'Leitor' },
    { id: 'vocabulary', label: 'Vocabulário' },
    { id: 'game', label: 'Revisão' },
  ]

  return (
    <div className={`app-shell ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div className="app-brand">Leitor Inteligente</div>

        <nav className="app-navigation" aria-label="Navegação principal">
          {navigationItems.map((item) => (
            <button
              className={activeView === item.id ? 'navigation-item active' : 'navigation-item'}
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={activeView === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="app-actions">
          <label className="language-picker" htmlFor="idioma-destino">
            Idioma da explicação
            <select id="idioma-destino" value={idiomaDestino} onChange={onLanguageChange}>
              <option value="Português">Português</option>
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
            </select>
          </label>
          <button type="button" onClick={onThemeToggle}>
            {isDarkMode ? 'Modo claro' : 'Modo escuro'}
          </button>
          <button className="logout-button" type="button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className="app-content">{content}</main>
    </div>
  )
}

export default AppLayout