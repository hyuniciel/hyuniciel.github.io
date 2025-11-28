/**
 * Main Application Module
 * Handles posts loading, rendering, and tag filtering
 */
(function () {
  'use strict';

  // State
  let allPosts = [];
  let activeTag = null;

  // DOM Elements
  let postsList = null;
  let tagsContainer = null;
  let loadingState = null;
  let emptyState = null;

  /**
   * Fetch posts.json
   */
  async function fetchPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  /**
   * Format date for display
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Create post card HTML
   */
  function createPostCard(post) {
    const tagsHtml = post.tags
      .map((tag) => `<span class="post-card-tag">#${tag}</span>`)
      .join('');

    return `
      <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-card">
        <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
        <div class="post-card-meta">
          <time class="post-card-date">${formatDate(post.date)}</time>
          ${post.category ? `<span class="post-card-category">${escapeHtml(post.category)}</span>` : ''}
        </div>
        ${post.excerpt ? `<p class="post-card-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        ${tagsHtml ? `<div class="post-card-tags">${tagsHtml}</div>` : ''}
      </a>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render posts to the DOM
   */
  function renderPosts(posts) {
    if (!postsList) return;

    if (posts.length === 0) {
      postsList.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    postsList.innerHTML = posts.map(createPostCard).join('');
  }

  /**
   * Extract unique tags from all posts
   */
  function extractTags(posts) {
    const tagSet = new Set();
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }

  /**
   * Render tags to the DOM
   */
  function renderTags(tags) {
    if (!tagsContainer || tags.length === 0) return;

    const tagsHtml = tags
      .map(
        (tag) =>
          `<button class="tag" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`,
      )
      .join('');

    tagsContainer.innerHTML = tagsHtml;

    // Add click handlers
    tagsContainer.querySelectorAll('.tag').forEach((tagBtn) => {
      tagBtn.addEventListener('click', () => {
        const tag = tagBtn.dataset.tag;
        filterByTag(tag);
      });
    });
  }

  /**
   * Filter posts by tag
   */
  function filterByTag(tag) {
    // Toggle active state
    if (activeTag === tag) {
      activeTag = null;
    } else {
      activeTag = tag;
    }

    // Update tag button states
    if (tagsContainer) {
      tagsContainer.querySelectorAll('.tag').forEach((tagBtn) => {
        if (tagBtn.dataset.tag === activeTag) {
          tagBtn.classList.add('active');
        } else {
          tagBtn.classList.remove('active');
        }
      });
    }

    // Filter and render posts
    const filteredPosts = activeTag
      ? allPosts.filter((post) => post.tags && post.tags.includes(activeTag))
      : allPosts;

    renderPosts(filteredPosts);

    // Notify search module to update
    if (window.BlogSearch && window.BlogSearch.setFilteredPosts) {
      window.BlogSearch.setFilteredPosts(filteredPosts);
    }
  }

  /**
   * Initialize the application
   */
  async function init() {
    // Get DOM elements
    postsList = document.getElementById('postsList');
    tagsContainer = document.getElementById('tagsContainer');
    loadingState = document.getElementById('loadingState');
    emptyState = document.getElementById('emptyState');

    // Fetch and render posts
    allPosts = await fetchPosts();

    // Hide loading state
    if (loadingState) {
      loadingState.style.display = 'none';
    }

    // Render content
    renderPosts(allPosts);
    renderTags(extractTags(allPosts));

    // Expose posts for search module
    window.BlogApp = {
      getAllPosts: () => allPosts,
      filterByTag: filterByTag,
      renderPosts: renderPosts,
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

