import "./Sidebar.css";

type MenuItem = {
  id: number;
  label: string;
  icon: string;
};

const menuItems: MenuItem[] = [
  { id: 1, label: "Accueil", icon: "⌂" },
  { id: 2, label: "Séries", icon: "▣" },
  { id: 3, label: "Films", icon: "▶" },
  { id: 4, label: "Ma liste", icon: "♡" },
  { id: 5, label: "Mes vidéos", icon: "⬇" },
];

type SidebarProps = {
  activeLabel: string;
  onSelect: (label: string) => void;
};

function Sidebar({ activeLabel, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">N</div>

      <nav className="sidebar-navigation">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              item.label === activeLabel
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => onSelect(item.label)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="sidebar-item sidebar-settings">
        <span className="sidebar-icon">⚙</span>
        <span className="sidebar-label">Paramètres</span>
      </button>
    </aside>
  );
}

export default Sidebar;
