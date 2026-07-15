import "./Header.css";

function Header() {
  return (
    <header className="header">
      <h1 className="header__logo">NETFLIX</h1>

      <nav className="header__nav">
        <a href="#">Accueil</a>
        <a href="#">Séries</a>
        <a href="#">Films</a>
        <a href="#">Ma liste</a>
      </nav>
    </header>
  );
}

export default Header;