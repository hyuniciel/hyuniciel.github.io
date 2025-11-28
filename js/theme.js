/**
 * Theme Toggle Module
 * Handles dark/light mode switching with localStorage persistence
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'blog-theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  /**
   * Get the current theme from localStorage or system preference
   */
  function getStoredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return LIGHT_THEME;
    }

    return DARK_THEME; // Default to dark
  }

  /**
   * Apply theme to the document
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Toggle between dark and light themes
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    applyTheme(newTheme);
  }

  /**
   * Initialize theme on page load
   */
  function initTheme() {
    // Apply theme immediately to prevent flash
    const theme = getStoredTheme();
    applyTheme(theme);

    // Set up toggle button
    document.addEventListener('DOMContentLoaded', function () {
      const toggleBtn = document.getElementById('themeToggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
      }
    });

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? LIGHT_THEME : DARK_THEME);
        }
      });
    }
  }

  // Initialize immediately
  initTheme();

  // Expose for external use if needed
  window.BlogTheme = {
    toggle: toggleTheme,
    set: applyTheme,
    get: getStoredTheme,
  };
})();

