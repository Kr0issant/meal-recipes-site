import React, { useState, useEffect } from 'react';
import FoodCard from './FoodCard';
import './Categories.css';
import '../App.css';

const CATEGORIES = [
    'Beef', 'Chicken', 'Dessert', 'Lamb', 'Seafood',
    'Vegan', 'Vegetarian', 'Pasta', 'Breakfast',
    'Starter', 'Side', 'Pork'
];

function CategoryRow({ category }) {
    const [meals, setMeals] = useState(Array(3).fill(null));
    const [bannerMeal, setBannerMeal] = useState(null);

    useEffect(() => {
        const fetchCategoryMeals = async () => {
            try {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
                const data = await res.json();
                if (data.meals) {
                    // Shuffle and pick 4 (1 for banner, 3 for cards)
                    const shuffled = data.meals.sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 4);

                    const processed = selected.map(meal => {
                        // In filter.php, we don't get full details, so we can't count ingredients 
                        // unless we fetch each meal. For now, let's use a random count between 5-15
                        const ingredientsCount = Math.floor(Math.random() * 10) + 5;
                        const customTime = `${ingredientsCount * 5} min`;
                        const customRating = (Math.random() * 2 + 3).toFixed(1);
                        const adjectives = ["delicious", "tasty", "great", "mouthwatering", "scrumptious", "delightful", "flavorful", "satisfying"];
                        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                        const customDescription = `A ${randomAdjective} ${category.toLowerCase()} dish.`;

                        return { ...meal, customTime, customRating, customDescription };
                    });

                    setBannerMeal(processed[0]);
                    setMeals(processed.slice(1, 4));
                }
            } catch (err) {
                console.error(`Failed to fetch ${category}:`, err);
            }
        };

        fetchCategoryMeals();
    }, [category]);

    return (
        <div className="category-row">
            <div className="category-mini-banner">
                {bannerMeal ? (
                    <>
                        <img src={bannerMeal.strMealThumb} alt={category} className="category-banner-img" />
                        <div className="category-banner-overlay">
                            <h2 className="category-banner-title">{category}</h2>
                        </div>
                    </>
                ) : (
                    <div className="skeleton-banner-bg">
                        <div className="category-banner-overlay">
                            <div className="skeleton-banner-title" style={{ width: '80%', height: '3rem' }}></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="category-cards-container">
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

function Categories() {
    return (
        <div className="page-container">
            <h1 className="home-title">Explore Categories</h1>
            <div className="categories-list">
                {CATEGORIES.map(cat => (
                    <CategoryRow key={cat} category={cat} />
                ))}
            </div>
        </div>
    );
}

export default Categories;