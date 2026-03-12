import React, { useState, useEffect, useRef } from 'react';
import FoodCard from './FoodCard';
import './RecipeIndex.css';
import mealsData from '../data/meals.json';
import '../App.css';

function Index() {
    const [selectedLetter, setSelectedLetter] = useState('A');
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setMeals(Array(8).fill(null)); // Show skeletons while loading

        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${selectedLetter}`)
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;

                if (data.meals) {
                    const processedMeals = data.meals.map(meal => {
                        const mealDietary = mealsData.find(m => m.id === meal.idMeal);
                        const isVegetarian = mealDietary ? mealDietary.isVegetarian : false;

                        const ingredientsCount = Array.from({ length: 20 })
                            .filter((_, i) => {
                                const ing = meal[`strIngredient${i + 1}`];
                                return ing && ing.trim() !== '';
                            }).length;
                        const customTime = `${ingredientsCount * 5} min`;
                        const customRating = (Math.random() * 2 + 3).toFixed(1);

                        const adjectives = ["delicious", "tasty", "great", "mouthwatering", "scrumptious", "delightful", "flavorful", "satisfying"];
                        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                        const customDescription = `A ${randomAdjective} ${meal.strArea} ${meal.strCategory.toLowerCase()} dish.`;

                        return { ...meal, customTime, customRating, customDescription, isVegetarian };
                    });
                    setMeals(processedMeals);
                } else {
                    setMeals([]);
                }
            })
            .catch(error => {
                console.error("Failed to fetch meals:", error);
                if (isMounted) setMeals([]);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedLetter]);

    return (
        <div className="page-container">
            <h1 className="home-title">Recipe Index</h1>

            <div className="alphabet-container">
                {alphabet.map((letter) => (
                    <button
                        key={letter}
                        className={`alphabet-btn ${selectedLetter === letter ? 'active' : ''}`}
                        onClick={() => setSelectedLetter(letter)}
                    >
                        {letter}
                    </button>
                ))}
            </div>

            <div className="food-cards-grid">
                {meals.length === 0 && !loading ? (
                    <p className="no-recipes-msg">No recipes found for the letter '{selectedLetter}'.</p>
                ) : (
                    meals.map((meal, index) => (
                        meal ? (
                            <FoodCard
                                key={meal.idMeal}
                                id={meal.idMeal}
                                title={meal.strMeal}
                                description={meal.customDescription}
                                image={meal.strMealThumb}
                                time={meal.customTime}
                                rating={meal.customRating}
                                isVegetarian={meal.isVegetarian}
                            />
                        ) : (
                            <div key={`skeleton-${index}`} className="food-card skeleton-card">
                                <div className="skeleton-img"></div>
                                <div className="food-card-content">
                                    <div className="skeleton-title"></div>
                                    <div className="skeleton-desc"></div>
                                    <div className="skeleton-desc" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        )
                    ))
                )}
            </div>
        </div>
    );
}

export default Index;