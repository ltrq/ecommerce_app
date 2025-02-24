import { Link, NavLink, Outlet } from 'react-router';
import { useUser } from '../context/userContext';
import '../styles/navbar.css';
import EcommerceLogo from './EcommerceLogo';
import Logout from './log-out';

export default function Navbar() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="navbar">
        <div className="navbar__logo">
          <EcommerceLogo size={60} color="black" />
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
          {user ? <Logout /> : <Link to="/sign-in">Sign in</Link>}
          {user ? (
            <div>{user.email}</div>
          ) : (
            <div className="btn btn--primary">
              <Link to="/sign-up">Sign up</Link>
            </div>
          )}
        </div>
      </div>
      <Outlet />
    </>
  );
}
