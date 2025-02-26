// import { Link, NavLink, Outlet } from 'react-router';
// import { useUser } from '../context/userContext';
// import '../styles/navbar.css';
// import EcommerceLogo from './EcommerceLogo';
// import Logout from './log-out';

// export default function Navbar() {
//   const { user, loading } = useUser();

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <div className="navbar">
//         <div className="navbar__logo">
//           <EcommerceLogo size={60} color="black" />
//         </div>
//         <div className="navbar__links">
//           <NavLink
//             to="/"
//             style={({ isActive }) => ({
//               color: isActive ? 'grey' : 'black',
//               fontWeight: isActive ? 'bolder' : 'normal',
//             })}
//           >
//             Home
//           </NavLink>
//           <NavLink
//             to="/deals"
//             style={({ isActive }) => ({
//               color: isActive ? 'grey' : 'black',
//               fontWeight: isActive ? 'bolder' : 'normal',
//             })}
//           >
//             Deals
//           </NavLink>
//           <NavLink
//             to="/new-arrivals"
//             style={({ isActive }) => ({
//               color: isActive ? 'grey' : 'black',
//               fontWeight: isActive ? 'bolder' : 'normal',
//             })}
//           >
//             New Arrivals
//           </NavLink>
//           <NavLink
//             to="/packages"
//             style={({ isActive }) => ({
//               color: isActive ? 'grey' : 'black',
//               fontWeight: isActive ? 'bolder' : 'normal',
//             })}
//           >
//             Packages
//           </NavLink>
//           {user ? <Logout /> : <Link to="/sign-in">Sign in</Link>}
//           {user ? (
//             <div>{user.email}</div>
//           ) : (
//             <div className="btn btn--primary">
//               <Link to="/sign-up">Sign up</Link>
//             </div>
//           )}
//         </div>
//       </div>
//       <Outlet />
//     </>
//   );
// }
import { Link, NavLink, Outlet } from 'react-router';
import { useUser } from '../context/userContext';
import { useState } from 'react';
import EcommerceLogo from './EcommerceLogo';
import Logout from './log-out';
import { Star, ShoppingBag, Search } from 'lucide-react';

function NavbarNotLoggedIn() {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Link to="/">
          <EcommerceLogo size={60} color="black" />
        </Link>
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
        <Link to="/">
          <EcommerceLogo size={60} color="black" />
        </Link>
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
