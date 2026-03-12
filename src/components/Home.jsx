import React, { useState, useEffect } from 'react';
import Banner from './Banner';
import FoodCard from "./FoodCard";
import '../App.css';

function Home() {
    const [meals, setMeals] = useState(Array(10).fill(null));

    const hasFetched = React.useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchMeals = () => {
            Array.from({ length: 10 }).forEach((_, index) => {
                fetch('https://www.themealdb.com/api/json/v1/1/random.php')
                    .then(res => res.json())
                    .then(data => {
                        const meal = data.meals[0];

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

                        setMeals(prev => {
                            const newMeals = [...prev];
                            newMeals[index] = { ...meal, customTime, customRating, customDescription };
                            return newMeals;
                        });
                    })
                    .catch(error => console.error("Failed to fetch meal:", error));
            });
        };
        fetchMeals();
    }, []);

    return (
        <div className="page-container">
            <Banner />
            <h1 className="home-title">Featured Recipes</h1>
            <div className="food-cards-grid">
                {meals.map((meal, index) => (
                    meal ? (
                        <FoodCard
                            key={meal.idMeal}
                            id={meal.idMeal}
                            title={meal.strMeal}
                            description={meal.customDescription}
                            image={meal.strMealThumb}
                            time={meal.customTime}
                            rating={meal.customRating}
                        />
                    ) : (
                        <div key={index} className="food-card skeleton-card">
                            <div className="skeleton-img"></div>
                            <div className="food-card-content">
                                <div className="skeleton-title"></div>
                                <div className="skeleton-desc"></div>
                                <div className="skeleton-desc" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

export default Home;