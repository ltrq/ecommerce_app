import { Link, NavLink, Outlet } from 'react-router';
import { useUser } from '../context/userContext';
import { useState } from 'react';
// import EcommerceLogo from '../components/EcommerceLogo';
import Logout from './log-out';
import { Star, ShoppingBag, Search } from 'lucide-react';

function NavbarNotLoggedIn() {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center">
        {/* <Link to="/">
          <EcommerceLogo size={60} color="black" />
        </Link> */}
      </div>

      {/* Center: Navigation Links (Not Logged In) */}
      <div className="flex gap-6">
        {['/', '/deals', '/new-arrivals', '/packages'].map((path) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              color: isActive ? 'grey' : 'black',
              fontWeight: isActive ? 'bolder' : 'normal',
            })}
          >
            {path.replace('/', '').replace('-', ' ') || 'Home'}
          </NavLink>
        ))}
      </div>

      {/* Right: User Actions (Not Logged In) */}
      <div className="flex items-center gap-4">
        <Link to="/sign-in" className="text-lg text-black hover:text-gray-500">
          Sign in
        </Link>
        <Link
          to="/sign-up"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

function NavbarLoggedIn() {
  const [isPagesOpen, setIsPagesOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center">
        {/* <Link to="/">
          <EcommerceLogo size={60} color="black" />
        </Link> */}
      </div>

      {/* Center: Navigation Links (Logged In) */}
      <div className="flex items-center gap-6">
        {['/', '/shop', '/products'].map((path) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `text-lg ${
                isActive
                  ? 'text-gray-600 font-bold'
                  : 'text-black hover:text-gray-500'
              }`
            }
          >
            {path.replace('/', '') || 'Home'}
          </NavLink>
        ))}

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsPagesOpen(!isPagesOpen)}
            className="text-lg text-black hover:text-gray-500 focus:outline-none"
          >
            Pages ▼
          </button>
          {isPagesOpen && (
            <div className="absolute bg-white shadow-lg rounded mt-2 w-32">
              {['/deals', '/packages', '/new-arrivals'].map((path) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive
                        ? 'text-gray-600 font-bold'
                        : 'text-black hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setIsPagesOpen(false)}
                >
                  {path.replace('/', '').replace('-', ' ')}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Icons (Logged In) */}
      <div className="flex items-center gap-4">
        <Link to="/search">
          <Search color="black" />
        </Link>
        <Logout />
        <Link to="/favorites">
          <Star color="black" />
        </Link>
        <Link to="/cart">
          <ShoppingBag color="black" />
        </Link>
      </div>
    </nav>
  );
}

export default function Navbar() {
  const { user, loading } = useUser();

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <>
      {user ? <NavbarLoggedIn /> : <NavbarNotLoggedIn />}
      <Outlet />
    </>
  );
}
