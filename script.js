// Load posts data and render pages
document.addEventListener('DOMContentLoaded', function() {
    // Get current page type
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        loadIndexPage();
    } else if (currentPage === 'post.html') {
        loadPostPage();
    }
});

function loadIndexPage() {
    // Load posts from data/posts.json
    fetch('data/posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            renderPostsList(posts);
            setupSearch(posts);
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.getElementById('posts-container').innerHTML = 
                '<div class="error-message"><p>Error loading posts. Please check if data/posts.json exists.</p></div>';
        });
}

function loadPostPage() {
    // Get post ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        document.getElementById('post-title').textContent = 'Post Not Found';
        document.getElementById('post-content').innerHTML = '<p>Invalid post ID.</p>';
        return;
    }
    
    // Load posts data
    fetch('data/posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            const post = posts.find(p => p.id.toString() === postId);
            if (post) {
                renderPostDetail(post);
            } else {
                document.getElementById('post-title').textContent = 'Post Not Found';
                document.getElementById('post-content').innerHTML = '<p>Post not found.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading post:', error);
            document.getElementById('post-title').textContent = 'Error Loading Post';
            document.getElementById('post-content').innerHTML = '<p>Error loading post data.</p>';
        });
}

function renderPostsList(posts) {
    const container = document.getElementById('posts-container');
    const noResults = document.getElementById('no-results');
    
    if (posts.length === 0) {
        container.innerHTML = '<p>No posts available.</p>';
        return;
    }
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const postsHTML = sortedPosts.map(post => `
        <div class="post-card">
            <h2>${escapeHtml(post.title)}</h2>
            <div class="post-meta">
                <span>${formatDate(post.date)}</span>
                <span>${post.tags ? `Tags: ${post.tags.join(', ')}` : ''}</span>
            </div>
            <div class="post-excerpt">
                <p>${escapeHtml(post.excerpt)}</p>
            </div>
            <a href="post.html?id=${post.id}" class="read-more">Read more</a>
        </div>
    `).join('');
    
    container.innerHTML = postsHTML;
}

function renderPostDetail(post) {
    document.getElementById('post-title').textContent = escapeHtml(post.title);
    document.getElementById('post-date').textContent = `Published: ${formatDate(post.date)}`;
    document.getElementById('post-tags').textContent = post.tags ? `Tags: ${post.tags.join(', ')}` : '';
    
    // Convert markdown-like line breaks to HTML paragraphs
    const content = post.content
        .split('\n\n')
        .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
    
    document.getElementById('post-content').innerHTML = content;
}

function setupSearch(posts) {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const postsContainer = document.getElementById('posts-container');
    const noResults = document.getElementById('no-results');
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            // Show all posts if search is empty
            renderPostsList(posts);
            noResults.style.display = 'none';
            return;
        }
        
        const filteredPosts = posts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const tagMatch = post.tags && post.tags.some(tag => 
                tag.toLowerCase().includes(searchTerm)
            );
            return titleMatch || tagMatch;
        });
        
        if (filteredPosts.length > 0) {
            renderPostsList(filteredPosts);
            noResults.style.display = 'none';
        } else {
            postsContainer.innerHTML = '';
            noResults.style.display = 'block';
        }
    }
    
    searchButton.addEventListener('click', performSearch);
    
    // Also search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
