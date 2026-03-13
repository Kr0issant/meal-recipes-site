import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/pot.png";
import "./Footer.css";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section brand">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <div className="footer-logo">
                            <img src={logo} height="50" width="50" alt="logo" />
                            <h2>The Simmer Camp</h2>
                        </div>
                    </Link>
                    <p className="footer-motto">Home-cooked goodness, one recipe at a time.</p>
                </div>

                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/categories">Categories</Link></li>
                        <li><Link to="/recipe-index">Recipe Index</Link></li>
                        <li><Link to="/favorites">Favorites</Link></li>
                    </ul>
                </div>

                <div className="footer-section social">
                    <h3>Follow Us</h3>
                    <div className="social-links">
                        <span className="social-icon">Instagram</span>
                        <span className="social-icon">Pinterest</span>
                        <span className="social-icon">Twitter</span>
                    </div>
                    <div className="github-link">
                        <a href="https://github.com/Kr0issant/meal-recipes-site" target="_blank" rel="noopener noreferrer">
                            View on GitHub
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} The Simmer Camp. Crafted with love.</p>
            </div>
        </footer>
    );
}

export default Footer;
