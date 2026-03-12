import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import { Home, Navbar, Categories, RecipeIndex, Favorites } from './components/_components';
import './App.css'

function App() {
  return (
    <BrowserRouter basename="/meal-recipes-site">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/recipe-index" element={<RecipeIndex />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
