import React, { useState, useEffect } from 'react';
import "./Navbar.css";
import searchIcon from "../assets/search.png";
import heartEmptyIcon from "../assets/heart_empty.png";
import heartFullIcon from "../assets/heart_full.png";
import logo from "../assets/pot.png";
import { Link, NavLink } from "react-router-dom";
import Search from "./Search";

function Navbar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [favCount, setFavCount] = useState(0);

    const updateFavCount = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavCount(favorites.length);
    };

    useEffect(() => {
        updateFavCount();
        window.addEventListener('favoritesUpdated', updateFavCount);
        return () => window.removeEventListener('favoritesUpdated', updateFavCount);
    }, []);

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    return (
        <>
            <div className="navbar">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div className="logo">
                        <img src={logo} height="64" width="64" alt="logo" />
                        <h1>The Simmer Camp</h1>
                    </div>
                </Link>
                <ul>
                    <li><NavLink to="/" className="nav-link" end>Home</NavLink></li>
                    <li><NavLink to="/categories" className="nav-link">Categories</NavLink></li>
                    <li><NavLink to="/recipe-index" className="nav-link">Recipe Index</NavLink></li>
                    <li>
                        <img
                            src={searchIcon}
                            height="32"
                            width="32"
                            alt="search"
                            onClick={toggleSearch}
                            style={{ cursor: 'pointer' }}
                        />
                    </li>
                    <li>
                        <NavLink to="/favorites" className="nav-link-icon">
                            <div className="nav-fav-container">
                                <img src={heartEmptyIcon} height="32" width="32" alt="favorites" />
                                {favCount > 0 && <span className="fav-counter">{favCount}</span>}
                            </div>
                        </NavLink>
                    </li>
                </ul>
            </div>

            <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

export default Navbar;