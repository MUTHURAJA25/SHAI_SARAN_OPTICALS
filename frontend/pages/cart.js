 // Cart Page Logic
document.addEventListener("DOMContentLoaded", () => {
    const contentSection = document.getElementById("cart-content-section");
    const emptySection = document.getElementById("cart-empty-section");
    const tableBody = document.getElementById("cart-table-body");
    const grandTotal = document.getElementById("cart-grand-total");
    
    function renderCart() {
        const cart = getCart();
        
        if (cart.length === 0) {
            contentSection.style.display = "none";
            emptySection.style.display = "block";
            return;
        }
        
        contentSection.style.display = "block";
        emptySection.style.display = "none";
        
        tableBody.innerHTML = cart.map(item => `
            <tr>
                <td style="font-weight: 600;">${escapeHtml(item.name)}</td>
                <td>
                    <span class="product-type">${escapeHtml(item.type)}</span>
                </td>
                <td>₹${item.price}</td>
                <td>
                    <input 
                        type="number" 
                        min="1" 
                        value="${item.quantity}" 
                        class="input quantity-input" 
                        data-id="${item.productId}"
                    >
                </td>
                <td style="font-weight: 600; color: var(--primary);">₹${item.price * item.quantity}</td>
                <td>
                    <button 
                        class="btn btn-outline remove-btn" 
                        style="padding: 6px 15px; border-color: rgba(244, 63, 94, 0.3); color: var(--error); background: rgba(244, 63, 94, 0.05); font-size: 0.8rem; border-radius: 15px;"
                        data-id="${item.productId}"
                    >
                        Remove
                    </button>
                </td>
            </tr>
        `).join('');
        
        grandTotal.textContent = `₹${getCartTotal()}`;
        
        // Setup Quantity Listeners
        document.querySelectorAll(".quantity-input").forEach(input => {
            input.addEventListener("change", (e) => {
                const id = e.target.getAttribute("data-id");
                const qty = parseInt(e.target.value) || 1;
                updateCartQuantity(id, qty);
                renderCart();
            });
        });
        
        // Setup Remove Listeners
        document.querySelectorAll(".remove-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                removeFromCart(id);
                renderCart();
            });
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
    
    // Initial render
    renderCart();
});
