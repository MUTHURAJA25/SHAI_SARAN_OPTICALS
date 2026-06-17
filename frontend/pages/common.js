// Common JavaScript for Mxk Opticals Multi-Page Application
const API_BASE = window.API_BASE_URL || "http://localhost:5000";

// CART UTILITIES (localStorage based)
const CART_KEY = "optical_cart";

function getCart() {
    try {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error reading cart", e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        // Dispatch custom event to notify current page elements if needed
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }));
    } catch (e) {
        console.error("Error saving cart", e);
    }
}

function addToCart(product, qty = 1) {
    const cart = getCart();
    const existing = cart.find(item => item.productId === product._id);
    
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            productId: product._id,
            name: product.name,
            type: product.type,
            price: product.price,
            quantity: qty
        });
    }
    
    saveCart(cart);
    updateCartBadge();
    showToast(`Added ${product.name} to cart!`);
}

function updateCartQuantity(productId, quantity) {
    let cart = getCart();
    cart = cart.map(item => {
        if (item.productId === productId) {
            return { ...item, quantity: parseInt(quantity) || 1 };
        }
        return item;
    }).filter(item => item.quantity > 0);
    
    saveCart(cart);
    updateCartBadge();
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);
    updateCartBadge();
    showToast("Item removed from cart");
}

function clearCart() {
    saveCart([]);
    updateCartBadge();
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// TOAST NOTIFICATIONS
function showToast(message) {
    // Remove existing toast if any
    const existing = document.querySelector(".toast-msg");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// DYNAMIC NAVBAR AND FOOTER INJECTION
function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    
    const count = getCartCount();
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}

function injectNavbarAndFooter() {
    // 1. Inject Navbar
    const header = document.createElement("header");
    header.className = "header";
    header.innerHTML = `
        <div class="nav-left">
            <div class="brand-mark">👓</div>
            <div>
                <div class="brand-name">MxK Opticals</div>
                <div class="brand-sub">Frames, lenses & contact lenses.</div>
            </div>
        </div>
        <nav class="nav-links">
            <a href="home.html" class="nav-link" id="nav-home">Home</a>
            <a href="frames.html" class="nav-link" id="nav-frames">Frames</a>
            <a href="lenses.html" class="nav-link" id="nav-lenses">Lenses</a>
            <a href="contact.html" class="nav-link" id="nav-contact">Contact</a>
            <a href="upload.html" class="nav-link" id="nav-upload">Upload Frames</a>
            <a href="cart.html" class="nav-link nav-cart" id="nav-cart">
                🛒 Cart
                <span class="nav-cart-count" id="cart-badge" style="display: none;">0</span>
            </a>
        </nav>
    `;
    
    // Insert header as the first element of body
    document.body.insertBefore(header, document.body.firstChild);
    
    // 2. Inject Footer
    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = `
        <div class="footer-brand">MxK Opticals</div>
        <div style="margin-bottom: 8px;">Address: No 1017 A, TH Road, Kaladipet, Thiruvottriyur, Chennai - 600019, Tamilnadu | Phone: +91 9152340647</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">© 2026 MxK Opticals. All Rights Reserved.</div>
    `;
    document.body.appendChild(footer);
    
    // 3. Highlight Active Link
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);
    
    if (pageName === "home.html" || pageName === "" || pageName === "index.html") {
        document.getElementById("nav-home").classList.add("active");
    } else if (pageName === "frames.html") {
        document.getElementById("nav-frames").classList.add("active");
    } else if (pageName === "lenses.html") {
        document.getElementById("nav-lenses").classList.add("active");
    } else if (pageName === "contact.html") {
        document.getElementById("nav-contact").classList.add("active");
    } else if (pageName === "upload.html") {
        document.getElementById("nav-upload").classList.add("active");
    } else if (pageName === "cart.html" || pageName === "checkout.html") {
        document.getElementById("nav-cart").classList.add("active");
    }
    
    // 4. Initialize Cart Badge
    updateCartBadge();
    
    // 5. Setup event listener for cart updates from other elements/scripts
    window.addEventListener("cartUpdated", () => {
        updateCartBadge();
    });
}

// Run injection when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNavbarAndFooter);
} else {
    injectNavbarAndFooter();
}
