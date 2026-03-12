import React, { useState, useEffect } from 'react';
import './FoodCard.css';
import FoodInfo from "./FoodInfo";
import heartEmptyIcon from "../assets/heart_empty.png";
import heartFullIcon from "../assets/heart_full.png";

function FoodCard({
    id,
    title = "Cozy Pancakes",
    description = "Fluffy morning pancakes with warm maple syrup and fresh berries.",
    time = "20 min",
    rating = "4.8",
    image = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800"
}) {
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.some(fav => fav.id === id));
    }, [id]);

    const toggleFavorite = (e) => {
        e.stopPropagation();
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavorites;

        if (isFavorite) {
            newFavorites = favorites.filter(fav => fav.id !== id);
        } else {
            const newFav = { id, title, description, time, rating, image };
            newFavorites = [...favorites, newFav];
        }

        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);

        // Dispatch custom event to notify Favorites page
        window.dispatchEvent(new Event('favoritesUpdated'));
    };

    return (
        <>
            <div className="food-card" onClick={() => setIsInfoOpen(true)} style={{ cursor: 'pointer' }}>
                <div className="food-card-img-container">
                    <img src={image} alt={title} className="food-card-img" />
                    <button
                        className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
                        onClick={toggleFavorite}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <img src={isFavorite ? heartFullIcon : heartEmptyIcon} alt="" />
                    </button>
                </div>
                <div className="food-card-content">
                    <h2 className="food-card-title">{title}</h2>
                    <p className="food-card-desc">{description}</p>
                    <div className="food-card-footer">
                        <span className="food-card-time">⏱ {time}</span>
                        <span className="food-card-rating">{rating} ★</span>
                    </div>
                </div>
            </div>
            {isInfoOpen && (
                <FoodInfo id={id} onClose={() => setIsInfoOpen(false)} />
            )}
        </>
    );
}

export default FoodCard;