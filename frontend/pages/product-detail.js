// Product Detail Page Logic
document.addEventListener("DOMContentLoaded", () => {
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");
    const container = document.getElementById("product-detail-container");
    
    const pIcon = document.getElementById("product-detail-icon");
    const pTypeBadge = document.getElementById("product-type-badge");
    const pName = document.getElementById("product-name");
    const pBrand = document.getElementById("product-brand");
    const pPrice = document.getElementById("product-price");
    const pDesc = document.getElementById("product-desc");
    const attributesTable = document.getElementById("attributes-table");
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    
    let product = null;
    
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    
    if (!id) {
        loadingState.style.display = "none";
        errorState.style.display = "block";
        return;
    }
    
    async function loadProduct() {
        try {
            const res = await fetch(`${API_BASE}/api/products/${id}`);
            if (!res.ok) throw new Error("Product not found");
            
            product = await res.json();
            renderProductDetails(product);
        } catch (e) {
            console.error("Error loading product", e);
            loadingState.style.display = "none";
            errorState.style.display = "block";
        }
    }
    
    function renderProductDetails(data) {
        loadingState.style.display = "none";
        container.style.display = "grid";
        
        // 1. Title/Name/Brand/Price
        pName.textContent = data.name;
        pBrand.textContent = data.brand || "No Brand";
        pPrice.textContent = `₹${data.price}`;
        pDesc.textContent = data.description || "No description available for this item.";
        
        // 2. Type badge and icon
        const typeNames = {
            frame: "Frame",
            lens: "Lens",
            "contact-lens": "Contact Lens"
        };
        const icons = {
            frame: "👓",
            lens: "🔍",
            "contact-lens": "👁️"
        };
        
        pTypeBadge.textContent = typeNames[data.type] || data.type;
        
        const graphicContainer = document.querySelector(".product-detail-graphic");
        if (data.images && data.images.length > 0 && data.images[0]) {
            graphicContainer.innerHTML = `<img src="${data.images[0]}" alt="${escapeHtml(data.name)}" class="product-detail-image" />`;
        } else {
            graphicContainer.innerHTML = `<div id="product-detail-icon" class="product-detail-image-fallback">${icons[data.type] || "👓"}</div>`;
        }
        
        // Render category colors for badges
        if (data.type === "lens") {
            pTypeBadge.style.background = "rgba(56, 189, 248, 0.1)";
            pTypeBadge.style.color = "var(--accent)";
        } else if (data.type === "contact-lens") {
            pTypeBadge.style.background = "rgba(16, 185, 129, 0.1)";
            pTypeBadge.style.color = "var(--success)";
        } else {
            pTypeBadge.style.background = "rgba(250, 204, 21, 0.1)";
            pTypeBadge.style.color = "var(--primary)";
        }
        
        // 3. Render Attributes table
        const attr = data.attributes || {};
        let tableHtml = "";
        
        const attributesToRender = [
            { key: "modelNumber", label: "Model Number" },
            { key: "size", label: "Size" },
            { key: "color", label: "Color" },
            { key: "material", label: "Material" },
            { key: "shape", label: "Shape" },
            { key: "lensType", label: "Lens Type" },
            { key: "powerRange", label: "Power Range" },
            { key: "baseCurve", label: "Base Curve" },
            { key: "diameter", label: "Diameter" }
        ];
        
        attributesToRender.forEach(spec => {
            if (attr[spec.key]) {
                tableHtml += `
                    <div class="attribute-row">
                        <span class="attribute-name">${spec.label}</span>
                        <span class="attribute-value">${escapeHtml(attr[spec.key])}</span>
                    </div>
                `;
            }
        });
        
        if (tableHtml === "") {
            tableHtml = `<p style="font-size: 0.85rem; color: var(--text-muted); padding: 5px 0;">No generic specifications.</p>`;
        }
        
        attributesTable.innerHTML = tableHtml;
        
        // 4. Bind Add to Cart action
        addToCartBtn.addEventListener("click", () => {
            addToCart(product, 1);
            if (product && product.type === "frame") {
                setTimeout(() => {
                    window.location.href = "prescription.html?redirect=checkout.html";
                }, 800);
            }
        });
    }
    
    // Helper to escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Initialize
    loadProduct();
});
