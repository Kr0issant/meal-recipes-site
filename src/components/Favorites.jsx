import React, { useState, useEffect } from 'react';
import FoodCard from './FoodCard';
import '../App.css';

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [displayFavorites, setDisplayFavorites] = useState([]);

    const loadFavorites = () => {
        const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(stored);

        // Staggered display
        setDisplayFavorites(Array(stored.length).fill(null));
        stored.forEach((meal, index) => {
            setTimeout(() => {
                setDisplayFavorites(prev => {
                    const newFavs = [...prev];
                    newFavs[index] = meal;
                    return newFavs;
                });
            }, index * 50);
        });
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
                    {displayFavorites.map((meal, index) => (
                        meal ? (
                            <FoodCard
                                key={meal.id}
                                id={meal.id}
                                title={meal.title}
                                description={meal.description}
                                image={meal.image}
                                time={meal.time}
                                rating={meal.rating}
                                isVegetarian={meal.isVegetarian}
                            />
                        ) : (
                            <div key={`skeleton-${index}`} className="food-card skeleton-card">
                                <div className="skeleton-img"></div>
                                <div className="food-card-content">
                                    <div className="skeleton-title"></div>
                                    <div className="skeleton-desc"></div>
                                </div>
                            </div>
                        )
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