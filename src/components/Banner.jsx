import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Banner.css';
import FoodInfo from './FoodInfo';

function Banner() {
    const [meals, setMeals] = useState(Array(5).fill(null));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedId, setSelectedId] = useState(null);

    const hasFetched = React.useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchMeals = () => {
            Array.from({ length: 5 }).forEach((_, index) => {
                axios.get('https://www.themealdb.com/api/json/v1/1/random.php')
                    .then(res => {
                        const meal = res.data.meals[0];
                        setMeals(prev => {
                            const newMeals = [...prev];
                            newMeals[index] = {
                                id: meal.idMeal,
                                title: meal.strMeal,
                                image: meal.strMealThumb
                            };
                            return newMeals;
                        });
                    })
                    .catch(error => console.error('Error fetching data:', error));
            });
        };

        fetchMeals();
    }, []);

    useEffect(() => {
        // Wait until at least one meal is loaded before starting the interval
        if (!meals.some(m => m !== null) || selectedId !== null) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % meals.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [meals, selectedId]);

    return (
        <>
            <div className="banner-container">
                {meals.map((meal, index) => (
                    meal ? (
                        <div
                            key={meal.id + '-' + index}
                            className={`banner-slide ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setSelectedId(meal.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img src={meal.image} alt={meal.title} className="banner-img" />
                            <div className="banner-content">
                                <h2 className="banner-title">{meal.title}</h2>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={`skeleton-${index}`}
                            className={`banner-slide skeleton-banner ${index === currentIndex ? 'active' : ''}`}
                        >
                            <div className="skeleton-banner-bg"></div>
                            <div className="banner-content skeleton-content">
                                <div className="skeleton-banner-title"></div>
                            </div>
                        </div>
                    )
                ))}
                <div className="banner-indicators">
                    {meals.map((_, index) => (
                        <div
                            key={`indicator-${index}`}
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(index);
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {selectedId && (
                <FoodInfo id={selectedId} onClose={() => setSelectedId(null)} />
            )}
        </>
    );
}

export default Banner;