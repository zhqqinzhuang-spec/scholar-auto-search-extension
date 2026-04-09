# scholar-auto-search-extension
This is a small plugin for Google Scholar that allows you to automatically search for research of interest through the search method in this tool when browsing a scholar's Scholar paper list page．
Scholar Auto Search — Chrome Extension


# Scholar Auto Search — Chrome Extension
## Introduction
A Chrome extension for Google Scholar (professor pages or search results pages). Features include:

- Automatically extract paper entries from scholar profiles or search results pages;
- Locally match keywords and highlight matching entries;
- Local approximate "semantic" search (based on string n-gram Jaccard similarity) to find papers similar to a sample title/description;
- Configurable remote backend (optional): send papers on the page along with user queries to the backend for more accurate semantic retrieval (backend must implement embeddings or similarity logic on its own).

## Usage (Local Testing)
1. Copy the project folder to your local machine.
2. Open Chrome, go to `chrome://extensions/`, and enable "Developer mode".
3. Click "Load unpacked" and select the project folder.
4. Open Google Scholar (scholar profile or search results), click the extension icon to open the popup, enter keywords or a semantic example to run the search.
5. Matching / similar results will be highlighted on the page (orange outline).

## About Semantic Search (Optional)
The extension includes a built-in local approximate semantic method (n-gram Jaccard) for fast, offline similarity judgment. It works well for short text such as titles but is less accurate than vector-based embedding methods.

For stronger semantic matching, deploy or replace the backend service (e.g., using OpenAI embeddings / local sentence-transformers), configure `backendUrl` and (optional) `backendApiKey` in extension settings, then enable proxy calls to the backend in `background.js`.

## Extension Ideas
- Backend semantic search (embedding + ANN);
- Filter by year, citation count, etc. (requires additional page scraping or third-party APIs);
- Export results to CSV / BibTeX;
- Show PDF links for each paper directly in the popup (if available on the page).

Paper Search API: https://api.pasa.com/v1/paper/search
