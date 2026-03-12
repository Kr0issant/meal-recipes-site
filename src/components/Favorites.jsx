import React, { useState, useEffect } from 'react';
import FoodCard from './FoodCard';
import '../App.css';

function Favorites() {
    const [favorites, setFavorites] = useState([]);

    const loadFavorites = () => {
        const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(stored);
    };

    useEffect(() => {
        loadFavorites();

        // Listen for updates from other components
        window.addEventListener('favoritesUpdated', loadFavorites);
        return () => window.removeEventListener('favoritesUpdated', loadFavorites);
    }, []);

    return (
        <div className="page-container">
            <h1 className="home-title">My Favorite Recipes</h1>
            {favorites.length > 0 ? (
                <div className="food-cards-grid">
                    {favorites.map(meal => (
                        <FoodCard
                            key={meal.id}
                            id={meal.id}
                            title={meal.title}
                            description={meal.description}
                            image={meal.image}
                            time={meal.time}
                            rating={meal.rating}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    boxShadow: '4px 4px 0px rgba(143, 47, 26, 0.1)',
                    fontFamily: '"Iosevka Charon Mono", monospace',
                    color: '#5c3a21'
                }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>You haven't saved any favorites yet.</p>
                    <p style={{ opacity: 0.7 }}>Browse recipes and click the heart icon to save them here!</p>
                </div>
            )}
        </div>
    );
}

export default Favorites;