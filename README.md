# Minimal Static Blog

A lightweight, responsive static blog built with pure HTML, CSS, and JavaScript.

## Features

- Pure static site (HTML/CSS/JS only)
- Index page listing all posts
- Post detail page (`post.html?id=<id>`)
- 3 sample posts in `data/posts.json`
- Responsive layout
- Search by title or tag

## Structure

- `index.html` – post list + search
- `post.html` – post detail template
- `style.css` – styles
- `script.js` – data loading, rendering, search logic
- `data/posts.json` – sample data

## Run locally

```bash
cd static-blog
python3 -m http.server 8000
```

Open: <http://localhost:8000/index.html>
