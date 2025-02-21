import '../styles/e404.css';
import { NavLink } from 'react-router';

export default function E404() {
  return (
    <div className="e404-page">
      <div className="e404-content">
        <div>Oops! Page Not Found</div>
        <NavLink to="/">Home</NavLink>
      </div>
    </div>
  );
}
