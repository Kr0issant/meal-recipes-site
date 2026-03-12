import React, { useEffect, useRef, useState } from 'react';
import './Search.css';

function Search({ isOpen, onClose }) {
    const inputRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, 300); // 300ms matches CSS animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current && !isClosing) {
            inputRef.current.focus();
        }
    }, [isOpen, isClosing]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    return (
        <div className={`search-overlay ${isClosing ? 'closing' : ''}`}>
            <button className="search-close-btn" onClick={onClose} aria-label="Close search">
                &times;
            </button>
            <div className="search-container">
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search for recipes..."
                />
                <button className="search-submit-btn">Search</button>
            </div>
            <p className="search-hint">Press Esc to close</p>
        </div>
    );
}

export default Search;
