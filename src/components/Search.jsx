import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';
import FoodCard from './FoodCard';
import './Search.css';
import mealsData from '../data/meals.json';

function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter Lists
    const [categories, setCategories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    // Selection States
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg', 'non-veg'

    // Internal Search for Filters
    const [areaFilter, setAreaFilter] = useState('');
    const [ingredientFilter, setIngredientFilter] = useState('');

    const hasFetchedLists = useRef(false);

    useEffect(() => {
        if (hasFetchedLists.current) return;
        hasFetchedLists.current = true;

        const fetchLists = async () => {
            try {
                const [catRes, areaRes, ingRes] = await Promise.all([
                    axios.get('https://www.themealdb.com/api/json/v1/1/list.php?c=list'),
                    axios.get('https://www.themealdb.com/api/json/v1/1/list.php?a=list'),
                    axios.get('https://www.themealdb.com/api/json/v1/1/list.php?i=list')
                ]);

                setCategories((catRes.data.meals || []).sort((a, b) => a.strCategory.localeCompare(b.strCategory)));
                setAreas((areaRes.data.meals || []).sort((a, b) => a.strArea.localeCompare(b.strArea)));
                setIngredients((ingRes.data.meals || []).sort((a, b) => a.strIngredient.localeCompare(b.strIngredient)));
            } catch (err) {
                console.error("Failed to fetch filter lists:", err);
            }
        };

        fetchLists();
    }, []);

    // Perform Search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedCategory, selectedArea, selectedIngredients, dietaryFilter]);

    // Initialize Fuse for fuzzy search
    const fuse = React.useMemo(() => new Fuse(mealsData, {
        keys: ['title'],
        threshold: 0.3,
        distance: 100
    }), []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const filterSets = [];

            // 1. Fuzzy Search IDs
            if (searchQuery) {
                const fuseResults = fuse.search(searchQuery);
                filterSets.push(fuseResults.map(r => r.item.id));
            }

            // 2. Category IDs
            if (selectedCategory) {
                const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`);
                filterSets.push((res.data.meals || []).map(m => m.idMeal));
            }

            // 3. Area IDs
            if (selectedArea) {
                const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${selectedArea}`);
                filterSets.push((res.data.meals || []).map(m => m.idMeal));
            }

            // 4. Ingredient IDs
            for (const ing of selectedIngredients) {
                const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ing}`);
                filterSets.push((res.data.meals || []).map(m => m.idMeal));
            }

            // 5. Intersect IDs
            let finalIds = [];
            if (filterSets.length > 0) {
                finalIds = filterSets.reduce((a, b) => a.filter(id => b.includes(id)));
            } else {
                // Show all recipes by default instead of an empty state
                finalIds = mealsData.map(m => m.id);
            }

            // 6. Strict Dietary Filter (Intersection with local data)
            if (dietaryFilter !== 'all') {
                const isVegTarget = dietaryFilter === 'veg';
                finalIds = finalIds.filter(id => {
                    const meal = mealsData.find(m => m.id === id);
                    return meal ? meal.isVegetarian === isVegTarget : false;
                });
            }

            // 7. Hydrate Top Results (API lookup for metadata)
            // Limit to top 50 to avoid too many requests
            const limitedIds = finalIds.slice(0, 50);

            const hydratedMeals = await Promise.all(limitedIds.map(async (id) => {
                const res = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
                return res.data.meals ? res.data.meals[0] : null;
            }));

            setResults(hydratedMeals.filter(m => m !== null));
        } catch (err) {
            console.error("Search failed:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedArea('');
        setSelectedIngredients([]);
        setAreaFilter('');
        setIngredientFilter('');
        setDietaryFilter('all');
    };

    const renderResults = () => {
        if (loading) {
            return Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="food-card skeleton-card">
                    <div className="skeleton-img"></div>
                    <div className="food-card-content">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-desc"></div>
                    </div>
                </div>
            ));
        }

        if (results.length === 0) {
            return (
                <div className="empty-results">
                    <p>No recipes found matching your criteria.</p>
                    <button onClick={resetFilters} className="sidebar-reset-btn" style={{ maxWidth: '200px', margin: '1.5rem auto 0' }}>
                        Reset All Filters
                    </button>
                </div>
            );
        }

        return results.map(meal => {
            const isVegetarian = mealsData.find(m => m.id === meal.idMeal)?.isVegetarian ?? false;
            return (
                <FoodCard
                    key={meal.idMeal}
                    id={meal.idMeal}
                    title={meal.strMeal}
                    image={meal.strMealThumb}
                    description={meal.strCategory ? `A delicious ${meal.strCategory.toLowerCase()} dish.` : `A tasty recipe to try!`}
                    time="25 min"
                    rating={(Math.random() * 1.5 + 3.5).toFixed(1)}
                    isVegetarian={isVegetarian}
                />
            );
        });
    };

    return (
        <div className="page-container search-page-layout">
            <aside className="search-sidebar">
                <div className="sidebar-section">
                    <h2 className="sidebar-title">Find Recipes</h2>
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="main-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 className="section-title">Categories</h3>
                    <div className="filter-chips">
                        <button
                            className={`filter-chip ${selectedCategory === '' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('')}
                        >All</button>
                        {categories.map(cat => (
                            <button
                                key={cat.strCategory}
                                className={`filter-chip ${selectedCategory === cat.strCategory ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.strCategory)}
                            >
                                {cat.strCategory}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 className="section-title">Dietary Preference</h3>
                    <div className="diet-toggle-group">
                        <button
                            className={`diet-btn ${dietaryFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setDietaryFilter('all')}
                        >All</button>
                        <button
                            className={`diet-btn ${dietaryFilter === 'veg' ? 'active' : ''}`}
                            onClick={() => setDietaryFilter('veg')}
                        >Veg</button>
                        <button
                            className={`diet-btn ${dietaryFilter === 'non-veg' ? 'active' : ''}`}
                            onClick={() => setDietaryFilter('non-veg')}
                        >Non-Veg</button>
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 className="section-title">Regions</h3>
                    <div className="filter-dropdown-search">
                        <input
                            type="text"
                            placeholder="Search regions..."
                            className="filter-search-input"
                            value={areaFilter}
                            onChange={(e) => setAreaFilter(e.target.value)}
                        />
                        <div className="filter-scroll-list">
                            <label className="filter-checkbox-label">
                                <input
                                    type="radio"
                                    name="area"
                                    checked={selectedArea === ''}
                                    onChange={() => setSelectedArea('')}
                                />
                                <span>All Regions</span>
                            </label>
                            {areas.filter(a => a.strArea.toLowerCase().includes(areaFilter.toLowerCase())).map(area => (
                                <label key={area.strArea} className="filter-checkbox-label">
                                    <input
                                        type="radio"
                                        name="area"
                                        checked={selectedArea === area.strArea}
                                        onChange={() => setSelectedArea(area.strArea)}
                                    />
                                    <span>{area.strArea}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 className="section-title">Ingredients</h3>
                    <div className="filter-dropdown-search">
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            className="filter-search-input"
                            value={ingredientFilter}
                            onChange={(e) => setIngredientFilter(e.target.value)}
                        />
                        <div className="filter-scroll-list">
                            {ingredients.filter(i => i.strIngredient.toLowerCase().includes(ingredientFilter.toLowerCase())).map(ing => (
                                <label key={ing.strIngredient} className="filter-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedIngredients.includes(ing.strIngredient)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedIngredients([...selectedIngredients, ing.strIngredient]);
                                            else setSelectedIngredients(selectedIngredients.filter(i => i !== ing.strIngredient));
                                        }}
                                    />
                                    <span>{ing.strIngredient}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    className="sidebar-reset-btn"
                    onClick={resetFilters}
                >
                    Reset All Filters
                </button>
            </aside>

            <main className="search-results-area">
                <h1 className="home-title">
                    {loading ? 'Searching...' : results.length > 0 ? `Results (${results.length})` : 'Search Results'}
                </h1>
                <div className="food-cards-grid">
                    {renderResults()}
                </div>
            </main>
        </div>
    )
}

export default Search;
