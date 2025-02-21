import { NavLink, Outlet } from 'react-router';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <>
      <Outlet />
      <footer>
        <div className="footer-container">
          <div className="footer-signup">
            <h3>Sign Up for Our Newsletter</h3>
            <p>
              Be the first to know about our special offers, new product
              launches, and events.
            </p>
            <div className="newsletter-container">
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email Address"
                />
                <button type="submit">Sign Up</button>
              </form>
            </div>
          </div>

          <div className="footer-columns">
            <div className="footer-section">
              <h3>Shop</h3>
              <div className="footer-links">
                <NavLink to="/shop?search=women">Women's</NavLink>
                <NavLink to="/shop?search=men">Men's</NavLink>
                <NavLink to="/shop?search=kids">Kids'</NavLink>
                <NavLink to="/shop?search=shoes">Shoes</NavLink>
                <NavLink to="/shop?search=equipment">Equipment</NavLink>
                <NavLink to="/shop?search=activity">By Activity</NavLink>
                <NavLink to="/shop?search=giftcards">Giftcards</NavLink>
                <NavLink to="/shop?search=sale">Sale</NavLink>
              </div>
            </div>

            <div className="footer-section">
              <h3>Help</h3>
              <div className="footer-links">
                <NavLink to="/help">Help Center</NavLink>
                <NavLink to="/order-status">Order Status</NavLink>
                <NavLink to="/size-chart">Size Chart</NavLink>
                <NavLink to="/returns-warranty">Returns & Warranty</NavLink>
                <NavLink to="/contact-us">Contact Us</NavLink>
              </div>
            </div>

            <div className="footer-section">
              <h3>About</h3>
              <div className="footer-links">
                <NavLink to="/about">About Us</NavLink>
                <NavLink to="/responsibility">Responsibility</NavLink>
                <NavLink to="/technology-innovation">
                  Technology & Innovation
                </NavLink>
                <NavLink to="/stories">Explore Our Stories</NavLink>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
