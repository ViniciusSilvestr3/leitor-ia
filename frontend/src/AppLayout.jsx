function AppLayout({
  activeView,
  isDarkMode,
  onNavigate,
  onThemeToggle,
  onLogout,
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