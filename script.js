// 加载文章数据并渲染页面
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '') {
        loadIndexPage();
    } else if (currentPage === 'post.html') {
        loadPostPage();
    }
});

function loadIndexPage() {
    fetch('data/posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 错误: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            renderPostsList(posts);
            setupSearch(posts);
        })
        .catch(error => {
            console.error('加载文章失败:', error);
            document.getElementById('posts-container').innerHTML =
                '<div class="error-message"><p>文章加载失败，请检查 data/posts.json 是否存在。</p></div>';
        });
}

function loadPostPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        document.getElementById('post-title').textContent = '文章不存在';
        document.getElementById('post-content').innerHTML = '<p>无效的文章 ID。</p>';
        return;
    }

    fetch('data/posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 错误: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            const post = posts.find(p => p.id.toString() === postId);
            if (post) {
                renderPostDetail(post);
            } else {
                document.getElementById('post-title').textContent = '文章不存在';
                document.getElementById('post-content').innerHTML = '<p>未找到该文章。</p>';
            }
        })
        .catch(error => {
            console.error('加载文章失败:', error);
            document.getElementById('post-title').textContent = '加载失败';
            document.getElementById('post-content').innerHTML = '<p>文章数据加载失败。</p>';
        });
}

function renderPostsList(posts) {
    const container = document.getElementById('posts-container');

    if (posts.length === 0) {
        container.innerHTML = '<p>暂无文章。</p>';
        return;
    }

    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

    const postsHTML = sortedPosts.map(post => `
        <div class="post-card">
            <h2>${escapeHtml(post.title)}</h2>
            <div class="post-meta">
                <span>${formatDate(post.date)}</span>
                <span>${post.tags ? `标签：${post.tags.join('、')}` : ''}</span>
            </div>
            <div class="post-excerpt">
                <p>${escapeHtml(post.excerpt)}</p>
            </div>
            <a href="post.html?id=${post.id}" class="read-more">阅读全文</a>
        </div>
    `).join('');

    container.innerHTML = postsHTML;
}

function renderPostDetail(post) {
    document.getElementById('post-title').textContent = escapeHtml(post.title);
    document.getElementById('post-date').textContent = `发布时间：${formatDate(post.date)}`;
    document.getElementById('post-tags').textContent = post.tags ? `标签：${post.tags.join('、')}` : '';

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
            renderPostsList(posts);
            noResults.style.display = 'none';
            return;
        }

        const filteredPosts = posts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const tagMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm));
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
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
