/**
 * Search Module
 * Client-side search functionality for posts
 */
(function () {
  'use strict';

  // State
  let searchPosts = [];
  let searchInput = null;
  let debounceTimer = null;

  /**
   * Normalize text for search (lowercase, remove extra spaces)
   */
  function normalizeText(text) {
    return (text || '').toLowerCase().trim();
  }

  /**
   * Check if a post matches the search query
   */
  function matchesQuery(post, query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return true;
    }

    // Search in title
    if (normalizeText(post.title).includes(normalizedQuery)) {
      return true;
    }

    // Search in excerpt/description
    if (normalizeText(post.excerpt).includes(normalizedQuery)) {
      return true;
    }

    if (normalizeText(post.description).includes(normalizedQuery)) {
      return true;
    }

    // Search in tags
    if (Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        if (normalizeText(tag).includes(normalizedQuery)) {
          return true;
        }
      }
    }

    // Search in category
    if (normalizeText(post.category).includes(normalizedQuery)) {
      return true;
    }

    return false;
  }

  /**
   * Perform search and render results
   */
  function performSearch(query) {
    const posts = searchPosts.length > 0 ? searchPosts : (window.BlogApp?.getAllPosts() || []);
    const results = posts.filter((post) => matchesQuery(post, query));

    if (window.BlogApp && window.BlogApp.renderPosts) {
      window.BlogApp.renderPosts(results);
    }
  }

  /**
   * Debounced search handler
   */
  function handleSearchInput(event) {
    const query = event.target.value;

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce search for better performance
    debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 200);
  }

  /**
   * Set filtered posts (called when tag filter is applied)
   */
  function setFilteredPosts(posts) {
    searchPosts = posts;
    
    // Re-run search with current query
    if (searchInput && searchInput.value) {
      performSearch(searchInput.value);
    }
  }

  /**
   * Clear search input and reset results
   */
  function clearSearch() {
    if (searchInput) {
      searchInput.value = '';
    }
    searchPosts = [];
    
    if (window.BlogApp && window.BlogApp.getAllPosts) {
      const allPosts = window.BlogApp.getAllPosts();
      if (window.BlogApp.renderPosts) {
        window.BlogApp.renderPosts(allPosts);
      }
    }
  }

  /**
   * Initialize search functionality
   */
  function init() {
    searchInput = document.getElementById('searchInput');

    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);

      // Handle Escape key to clear search
      searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          clearSearch();
          searchInput.blur();
        }
      });

      // Handle keyboard shortcut to focus search (Ctrl/Cmd + K)
      document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          searchInput.focus();
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.BlogSearch = {
    search: performSearch,
    clear: clearSearch,
    setFilteredPosts: setFilteredPosts,
  };
})();

