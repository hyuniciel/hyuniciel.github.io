/**
 * Post Loader Module
 * Handles markdown loading, parsing, and Giscus integration
 */
(function () {
  'use strict';

  // DOM Elements
  let postTitle = null;
  let postDate = null;
  let postCategory = null;
  let postTags = null;
  let postContent = null;
  let giscusContainer = null;

  /**
   * Get post filename from URL query parameter
   */
  function getPostFile() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
  }

  /**
   * Parse Front Matter from markdown content
   */
  function parseFrontMatter(content) {
    // Remove UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);

    if (!match) {
      return {
        metadata: {},
        content: content,
      };
    }

    const frontMatter = match[1];
    const markdownContent = match[2];
    const metadata = {};

    // Parse front matter lines
    const lines = frontMatter.split(/\r?\n/);
    lines.forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Remove surrounding quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Parse arrays (tags)
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(',')
              .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        metadata[key] = value;
      }
    });

    return {
      metadata: metadata,
      content: markdownContent,
    };
  }

  /**
   * Configure marked.js for rendering
   */
  function configureMarked() {
    if (typeof marked === 'undefined') {
      console.error('marked.js is not loaded');
      return;
    }

    // Custom renderer for code blocks with Prism
    const renderer = new marked.Renderer();

    renderer.code = function (code, language) {
      // Handle code object format from newer marked versions
      if (typeof code === 'object') {
        language = code.lang;
        code = code.text;
      }
      
      const validLanguage = language && Prism.languages[language] ? language : 'plaintext';
      
      let highlighted;
      try {
        if (Prism.languages[validLanguage]) {
          highlighted = Prism.highlight(code, Prism.languages[validLanguage], validLanguage);
        } else {
          highlighted = escapeHtml(code);
        }
      } catch (e) {
        highlighted = escapeHtml(code);
      }

      return `<pre class="language-${validLanguage}" data-language="${validLanguage}"><code class="language-${validLanguage}">${highlighted}</code></pre>`;
    };

    marked.setOptions({
      renderer: renderer,
      breaks: true,
      gfm: true,
    });
  }

  /**
   * Escape HTML for safety
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
   * Render post metadata to the DOM
   */
  function renderMetadata(metadata) {
    // Title
    if (postTitle) {
      postTitle.textContent = metadata.title || 'Untitled';
      document.title = `${metadata.title || 'Post'} | hyuniciel's Blog`;
    }

    // Date
    if (postDate && metadata.date) {
      postDate.textContent = formatDate(metadata.date);
    }

    // Category
    if (postCategory && metadata.category) {
      postCategory.textContent = metadata.category;
    }

    // Tags
    if (postTags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
      postTags.innerHTML = metadata.tags
        .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
        .join('');
    }

    // Meta description
    if (metadata.description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', metadata.description);
      }
    }
  }

  /**
   * Render markdown content to HTML
   */
  function renderContent(markdownContent) {
    if (!postContent) return;

    try {
      const html = marked.parse(markdownContent);
      postContent.innerHTML = html;

      // Re-highlight any code blocks that might have been missed
      if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(postContent);
      }
    } catch (error) {
      console.error('Error rendering markdown:', error);
      postContent.innerHTML = '<p>게시글을 렌더링하는 중 오류가 발생했습니다.</p>';
    }
  }

  /**
   * Load and render Giscus comments
   */
  function loadGiscus() {
    if (!giscusContainer) return;

    // Get current theme
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const giscusTheme = theme === 'light' ? 'light' : 'dark_dimmed';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'hyuniciel/hyuniciel.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // TODO: Replace with actual repo ID
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // TODO: Replace with actual category ID
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', giscusTheme);
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    giscusContainer.appendChild(script);

    // Listen for theme changes and update Giscus
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          const newGiscusTheme = newTheme === 'light' ? 'light' : 'dark_dimmed';

          const iframe = document.querySelector('iframe.giscus-frame');
          if (iframe) {
            iframe.contentWindow.postMessage(
              { giscus: { setConfig: { theme: newGiscusTheme } } },
              'https://giscus.app',
            );
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  }

  /**
   * Show error state
   */
  function showError(message) {
    if (postTitle) {
      postTitle.textContent = '오류';
    }
    if (postContent) {
      postContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <p>${escapeHtml(message)}</p>
          <a href="index.html" class="back-link" style="margin-top: 1rem;">목록으로 돌아가기</a>
        </div>
      `;
    }
    document.title = '오류 | hyuniciel\'s Blog';
  }

  /**
   * Fetch and load the post
   */
  async function loadPost() {
    const filename = getPostFile();

    if (!filename) {
      showError('게시글을 찾을 수 없습니다.');
      return;
    }

    try {
      const response = await fetch(`pages/${filename}`);
      
      if (!response.ok) {
        throw new Error('Post not found');
      }

      const content = await response.text();
      const { metadata, content: markdownContent } = parseFrontMatter(content);

      configureMarked();
      renderMetadata(metadata);
      renderContent(markdownContent);
      loadGiscus();

    } catch (error) {
      console.error('Error loading post:', error);
      showError('게시글을 불러오는 중 오류가 발생했습니다.');
    }
  }

  /**
   * Initialize the post loader
   */
  function init() {
    // Get DOM elements
    postTitle = document.getElementById('postTitle');
    postDate = document.getElementById('postDate');
    postCategory = document.getElementById('postCategory');
    postTags = document.getElementById('postTags');
    postContent = document.getElementById('postContent');
    giscusContainer = document.getElementById('giscusContainer');

    // Load the post
    loadPost();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

