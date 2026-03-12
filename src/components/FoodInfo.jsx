import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import './FoodInfo.css';
import mealsData from '../data/meals.json';

function FoodInfo({ id, onClose }) {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    // Closing Animation and Keyboard Events
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    // Data Fetching Logic
    useEffect(() => {
        const controller = new AbortController();

        async function fetchFoodInfo() {
            if (!id) return;

            setLoading(true);
            try {
                const response = await axios.get(
                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
                    { signal: controller.signal }
                );
                setRecipe(response.data.meals[0]);
            } catch (error) {
                if (axios.isCancel(error)) return;
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFoodInfo();

        return () => controller.abort(); // Cleanup request if component unmounts
    }, [id]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="food-info-loading">
                    <p>Fetching cozy details...</p>
                </div>
            );
        }

        if (!recipe) {
            return (
                <div className="food-info-loading">
                    <p>No recipe found.</p>
                </div>
            );
        }

        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (recipe[`strIngredient${i}`] && recipe[`strIngredient${i}`].trim() !== '') {
                const name = recipe[`strIngredient${i}`].trim();
                const measure = recipe[`strMeasure${i}`] ? recipe[`strMeasure${i}`].trim() : '';
                ingredients.push({
                    name,
                    measure,
                    image: `https://www.themealdb.com/images/ingredients/${name}.png`
                });
            }
        }

        const instructionsArray = recipe.strInstructions
            .split(/(?:\r?\n|\.\s+)/)
            .map(step => step.replace(/^(step\s*\d+[:.\s]*|\d+[.)\s]*)/i, '').trim())
            .filter(step => step.length > 0)
            .map(step => step.endsWith('.') ? step : step + '.');

        const getCategoryClass = (category) => {
            if (!category) return 'tag-misc';
            const cat = category.toLowerCase();
            if (['beef', 'chicken', 'pork', 'lamb', 'goat'].includes(cat)) return 'tag-meat';
            if (['vegan', 'vegetarian'].includes(cat)) return 'tag-veg';
            if (cat === 'seafood') return 'tag-seafood';
            if (cat === 'dessert') return 'tag-dessert';
            if (cat === 'pasta') return 'tag-pasta';
            if (cat === 'breakfast') return 'tag-breakfast';
            if (['starter', 'side'].includes(cat)) return 'tag-sides';
            return 'tag-misc';
        };

        const isVegetarian = mealsData.find(m => m.id === id)?.isVegetarian ?? false;

        return (
            <div className="food-info-grid">
                <div className="food-info-left">
                    <div className="food-info-img-container">
                        <img
                            src={recipe.strMealThumb}
                            alt={recipe.strMeal}
                            className="food-info-image"
                        />
                        <div className={`diet-indicator ${isVegetarian ? 'veg' : 'non-veg'}`} title={isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}>
                            <div className="diet-dot"></div>
                        </div>
                    </div>
                    <div className="food-info-meta">
                        <span className="food-info-area tag-area">
                            {recipe.strArea}
                        </span>
                        <span className={`food-info-category ${getCategoryClass(recipe.strCategory)}`}>
                            {recipe.strCategory}
                        </span>
                    </div>

                    <div className="food-info-ingredients">
                        <h2>Ingredients</h2>
                        <ul>
                            {ingredients.map((item, index) => (
                                <li key={index}>
                                    <span className="ingredient-item">
                                        {item.measure} {item.name}
                                        <div className="ingredient-tooltip">
                                            <img src={item.image} alt={item.name} loading="lazy" />
                                        </div>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="food-info-right">
                    <h1 className="food-info-title">{recipe.strMeal}</h1>
                    <div className="food-info-instructions">
                        <h2>Instructions</h2>
                        <div className="instructions-list">
                            {instructionsArray.map((step, index) => (
                                <div key={index} className="instruction-step">
                                    <div className="step-number">{index + 1}</div>
                                    <p>{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return createPortal(
        <div className={`food-info-overlay ${isClosing ? 'closing' : ''}`}>
            <button className="food-info-close" onClick={handleClose} aria-label="Close page">
                &times;
            </button>

            <div className="food-info-content">
                {renderContent()}
            </div>
        </div>,
        document.body
    );
}

export default FoodInfo;