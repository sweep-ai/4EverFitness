import { Link } from 'react-router-dom';

export default function LogoBar() {
  return (
    <header className="logo-bar">
      <Link to="/" className="brand" aria-label="4EVERFIT home">
        <span className="brand-ever">4EVER</span>
        <span className="brand-fit">FIT</span>
      </Link>
    </header>
  );
}
