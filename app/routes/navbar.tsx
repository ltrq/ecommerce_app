import { Link, NavLink, Outlet } from 'react-router';
import '../styles/navbar.css';
import EcommerceLogo from './EcommerceLogo';

export default function navbar() {
  return (
    <>
      <div className="navbar">
        <div className="navbar__logo">
          <EcommerceLogo size={60} color={'black'} />
        </div>
        <div className="navbar__links">
          <NavLink
            to="/"
            style={({ isActive }) => ({
              color: isActive ? 'grey' : 'black',
              fontWeight: isActive ? 'bolder' : 'normal',
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/deals"
            style={({ isActive }) => ({
              color: isActive ? 'grey' : 'black',
              fontWeight: isActive ? 'bolder' : 'normal',
            })}
          >
            Deals
          </NavLink>
          <NavLink
            to="/new-arrivals"
            style={({ isActive }) => ({
              color: isActive ? 'grey' : 'black',
              fontWeight: isActive ? 'bolder' : 'normal',
            })}
          >
            New Arrivals
          </NavLink>
          <NavLink
            to="/packages"
            style={({ isActive }) => ({
              color: isActive ? 'grey' : 'black',
              fontWeight: isActive ? 'bolder' : 'normal',
            })}
          >
            Packages
          </NavLink>
          <Link to="/sign-in">Sign in</Link>
          <div className="btn btn--primary">
            <Link to="/sign-up">Sign up</Link>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
