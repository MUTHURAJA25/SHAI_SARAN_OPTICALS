// Checkout Page Logic
document.addEventListener("DOMContentLoaded", () => {
    const summaryList = document.getElementById("summary-items-list");
    const summaryTotal = document.getElementById("summary-total-amount");
    const payBtn = document.getElementById("pay-btn");
    const paymentMsg = document.getElementById("payment-message");
    
    // Inputs
    const inputName = document.getElementById("cust-name");
    const inputPhone = document.getElementById("cust-phone");
    const inputEmail = document.getElementById("cust-email");
    const inputAddress = document.getElementById("cust-address");
    const inputNotes = document.getElementById("cust-notes");
    
    const cart = getCart();
    
    // Check if cart is empty, if so redirect
    if (cart.length === 0) {
        window.location.replace("cart.html");
        return;
    }
    
    // Render Order Summary
    function renderSummary() {
        summaryList.innerHTML = cart.map(item => `
            <li class="checkout-summary-item">
                <span>${escapeHtml(item.name)} <strong>× ${item.quantity}</strong></span>
                <span style="font-weight: 600;">₹${item.price * item.quantity}</span>
            </li>
        `).join('');
        
        summaryTotal.textContent = `₹${getCartTotal()}`;
    }
    
    // Simple Input Validation to enable/disable Pay Button
    function validateForm() {
        const nameVal = inputName.value.trim();
        const phoneVal = inputPhone.value.trim();
        const addressVal = inputAddress.value.trim();
        
        if (nameVal && phoneVal && addressVal) {
            payBtn.removeAttribute("disabled");
        } else {
            payBtn.setAttribute("disabled", "true");
        }
    }
    
    // Message handler
    function showMessage(msg, type) {
        paymentMsg.style.display = "block";
        paymentMsg.textContent = msg;
        
        if (type === "success") {
            paymentMsg.style.background = "rgba(16, 185, 129, 0.1)";
            paymentMsg.style.border = "1px solid var(--success)";
            paymentMsg.style.color = "var(--success)";
        } else {
            paymentMsg.style.background = "rgba(244, 63, 94, 0.1)";
            paymentMsg.style.border = "1px solid var(--error)";
            paymentMsg.style.color = "var(--error)";
        }
    }
    
    // Razorpay checkout opening
    async function startPayment() {
        payBtn.setAttribute("disabled", "true");
        payBtn.textContent = "Starting payment...";
        paymentMsg.style.display = "none";
        
        const customer = {
            name: inputName.value.trim(),
            phone: inputPhone.value.trim(),
            email: inputEmail.value.trim(),
            address: inputAddress.value.trim()
        };
        
        const payload = {
            cartItems: cart.map(i => ({
                productId: i.productId,
                quantity: i.quantity
            })),
            customer,
            notes: inputNotes.value.trim()
        };
        
        try {
            const res = await fetch(`${API_BASE}/api/payment/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to start payment order creation");
            }
            
            const data = await res.json();
            
            // Razorpay options config
            const options = {
                key: data.razorpayKeyId,
                amount: Math.round(data.amount * 100),
                currency: data.currency || "INR",
                name: "MxK Opticals",
                description: "Glasses & Lens Order",
                order_id: data.razorpayOrderId,
                prefill: {
                    name: customer.name,
                    email: customer.email,
                    contact: customer.phone
                },
                handler: async function (response) {
                    try {
                        showMessage("Verifying payment...", "success");
                        const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: data.orderId
                            })
                        });
                        
                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok || !verifyData.success) {
                            throw new Error(verifyData.message || "Payment signature invalid");
                        }
                        
                        // Verification success!
                        showMessage("Payment successful! Thank you. We will contact you shortly.", "success");
                        clearCart();
                        setTimeout(() => {
                            window.location.replace("home.html");
                        }, 2500);
                        
                    } catch (err) {
                        console.error("Verification error", err);
                        showMessage(`Verification Error: ${err.message}`, "error");
                        payBtn.removeAttribute("disabled");
                        payBtn.textContent = "Pay Securely with Razorpay";
                    }
                },
                theme: {
                    color: "#facc15" // Matches our yellow primary theme
                },
                modal: {
                    ondismiss: function() {
                        payBtn.removeAttribute("disabled");
                        payBtn.textContent = "Pay Securely with Razorpay";
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.open();
            
        } catch (e) {
            console.error("Order creation failed", e);
            showMessage(`Checkout Error: ${e.message}`, "error");
            payBtn.removeAttribute("disabled");
            payBtn.textContent = "Pay Securely with Razorpay";
        }
    }
    
    // Hook input events to trigger live validations
    [inputName, inputPhone, inputAddress].forEach(input => {
        input.addEventListener("input", validateForm);
    });
    
    // Bind checkout action
    payBtn.addEventListener("click", startPayment);
    
    // Escape HTML Helper
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Initial Render and Validation checks
    renderSummary();
    validateForm();
});
