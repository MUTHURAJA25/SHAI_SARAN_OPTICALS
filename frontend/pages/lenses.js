// Lenses and Contact Lenses Listing Logic
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const brandInput = document.getElementById("brand-input");
    const productGrid = document.getElementById("product-grid");
    
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");
    const emptyState = document.getElementById("empty-state");
    
    const tabLens = document.getElementById("tab-lens");
    const tabContactLens = document.getElementById("tab-contact-lens");
    
    let currentType = "lens";
    let products = [];
    
    // Read category from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get("type");
    if (typeParam === "contact-lens") {
        currentType = "contact-lens";
        tabLens.classList.remove("active");
        tabContactLens.classList.add("active");
    }
    
    // Fetch products from API
    async function fetchProducts() {
        loadingState.style.display = "block";
        errorState.style.display = "none";
        emptyState.style.display = "none";
        productGrid.innerHTML = "";
        
        try {
            const params = new URLSearchParams();
            params.append("type", currentType);
            if (searchInput.value.trim()) params.append("search", searchInput.value.trim());
            if (brandInput.value.trim()) params.append("brand", brandInput.value.trim());
            
            const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to load products");
            
            products = await res.json();
            renderProducts(products);
        } catch (e) {
            console.error("Error loading products", e);
            errorState.style.display = "block";
            loadingState.style.display = "none";
        }
    }
    
    // Render product cards
    function renderProducts(items) {
        loadingState.style.display = "none";
        
        if (items.length === 0) {
            emptyState.style.display = "block";
            return;
        }
        
        const icon = currentType === "contact-lens" ? "👁️" : "🔍";
        
        productGrid.innerHTML = items.map(p => `
            <div class="product-card" id="card-${p._id}">
                <div class="product-info">
                    <div class="product-icon">${icon}</div>
                    <div class="product-name">${escapeHtml(p.name)}</div>
                    <div class="product-brand">${escapeHtml(p.brand || 'No Brand')}</div>
                    <div class="product-price">₹${p.price}</div>
                    <div class="product-type">${escapeHtml(p.type)}</div>
                </div>
                <div class="product-actions">
                    <a href="product-detail.html?id=${p._id}" class="btn btn-outline">View Details</a>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${p._id}">Add to Cart</button>
                </div>
            </div>
        `).join('');
        
        // Add Event Listeners to Add to Cart buttons
        document.querySelectorAll(".add-to-cart-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const product = products.find(p => p._id === id);
                if (product) {
                    addToCart(product, 1);
                }
            });
        });
    }
    
    // Helper to escape HTML and prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Tab switching handler
    function switchTab(type) {
        if (currentType === type) return;
        currentType = type;
        
        if (type === "lens") {
            tabLens.classList.add("active");
            tabContactLens.classList.remove("active");
        } else {
            tabLens.classList.remove("active");
            tabContactLens.classList.add("active");
        }
        
        // Update URL state silently
        const newUrl = `${window.location.pathname}?type=${type}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        
        fetchProducts();
    }
    
    tabLens.addEventListener("click", () => switchTab("lens"));
    tabContactLens.addEventListener("click", () => switchTab("contact-lens"));
    
    // Setup inputs debounce search
    let debounceTimer;
    function handleInput() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchProducts();
        }, 300);
    }
    
    searchInput.addEventListener("input", handleInput);
    brandInput.addEventListener("input", handleInput);
    
    // Initial fetch
    fetchProducts();
});
