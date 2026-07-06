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
    
    // Prescription display elements
    const prescriptionSummary = document.getElementById("prescription-summary-card");
    const prescriptionActionBtn = document.getElementById("prescription-action-btn");
    
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
    
    // Render Prescription Summary Card
    function renderPrescription() {
        if (!prescriptionSummary) return;
        
        try {
            const dataStr = localStorage.getItem("saved_prescription");
            if (!dataStr) {
                prescriptionSummary.innerHTML = `
                    No prescription details attached yet. Click "Add Prescription" above to provide your power specifications.
                `;
                prescriptionSummary.style.color = "var(--text-muted)";
                prescriptionSummary.style.borderStyle = "dashed";
                if (prescriptionActionBtn) prescriptionActionBtn.textContent = "➕ Add Prescription";
                return;
            }
            
            const data = JSON.parse(dataStr);
            if (prescriptionActionBtn) prescriptionActionBtn.textContent = "✏️ Edit Prescription";
            
            // Build details HTML
            let detailsHtml = `
                <div style="text-align: left; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; margin-bottom: 12px;">
                        <strong>Lens Design Type:</strong>
                        <span style="color: var(--accent); font-weight: 600;">${escapeHtml(data.lensType)}</span>
                    </div>
            `;
            
            // Check vision powers
            const hasDistance = data.dist_od_sph || data.dist_od_cyl || data.dist_od_axis || data.dist_os_sph || data.dist_os_cyl || data.dist_os_axis;
            const hasNear = data.near_od_sph || data.near_od_cyl || data.near_od_axis || data.near_os_sph || data.near_os_cyl || data.near_os_axis;
            
            if (hasDistance) {
                detailsHtml += `
                    <div style="margin-bottom: 12px; font-size: 0.85rem;">
                        <strong>Distance Vision Power:</strong>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; padding: 8px; background: rgba(255, 255, 255, 0.02); border-radius: 6px; color: var(--text-muted);">
                            <div>OD (Right): SPH ${escapeHtml(data.dist_od_sph || '0.00')} | CYL ${escapeHtml(data.dist_od_cyl || '0.00')} | AXIS ${escapeHtml(data.dist_od_axis || '0')}</div>
                            <div>OS (Left): SPH ${escapeHtml(data.dist_os_sph || '0.00')} | CYL ${escapeHtml(data.dist_os_cyl || '0.00')} | AXIS ${escapeHtml(data.dist_os_axis || '0')}</div>
                        </div>
                    </div>
                `;
            }
            
            if (hasNear) {
                detailsHtml += `
                    <div style="margin-bottom: 12px; font-size: 0.85rem;">
                        <strong>Near Vision Power:</strong>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; padding: 8px; background: rgba(255, 255, 255, 0.02); border-radius: 6px; color: var(--text-muted);">
                            <div>OD (Right): SPH ${escapeHtml(data.near_od_sph || '+0.00')} | CYL ${escapeHtml(data.near_od_cyl || '0.00')} | AXIS ${escapeHtml(data.near_od_axis || '0')}</div>
                            <div>OS (Left): SPH ${escapeHtml(data.near_os_sph || '+0.00')} | CYL ${escapeHtml(data.near_os_cyl || '0.00')} | AXIS ${escapeHtml(data.near_os_axis || '0')}</div>
                        </div>
                    </div>
                `;
            }
            
            const pdVal = data.dist_pd || data.near_pd;
            if (pdVal) {
                detailsHtml += `
                    <div style="border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; margin-bottom: 12px; font-size: 0.85rem;">
                        <strong>PD (Pupillary Distance):</strong> ${escapeHtml(pdVal)} mm
                    </div>
                `;
            }
            
            if (data.coatings && data.coatings.length > 0) {
                detailsHtml += `
                    <div style="margin-top: 8px;">
                        <strong>Selected Coatings & Features:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                            ${data.coatings.map(c => `
                                <span class="category-chip" style="margin-bottom: 0; font-size: 0.7rem; padding: 3px 10px; background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px;">
                                    ✓ ${escapeHtml(c)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            detailsHtml += `
                <div style="text-align: right; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
                    <a id="remove-prescription-btn" href="#" style="font-size: 0.8rem; color: var(--error); text-decoration: none; font-weight: 600;">🗑️ Remove Prescription</a>
                </div>
            </div>`;
            
            prescriptionSummary.innerHTML = detailsHtml;
            prescriptionSummary.style.color = "var(--text)";
            prescriptionSummary.style.borderStyle = "solid";
            
            // Bind remove button
            document.getElementById("remove-prescription-btn").addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to remove this prescription from the order?")) {
                    localStorage.removeItem("saved_prescription");
                    renderPrescription();
                    showToast("Prescription details removed");
                }
            });
            
        } catch (e) {
            console.error("Error rendering prescription summary", e);
        }
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
    
    // Dynamic Sandbox Checkout Modal for developer testing
    function openMockPaymentModal(data, customer) {
        const modal = document.createElement("div");
        modal.id = "mock-payment-modal";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.backgroundColor = "rgba(2, 6, 23, 0.85)";
        modal.style.backdropFilter = "blur(12px)";
        modal.style.webkitBackdropFilter = "blur(12px)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "1000";
        
        modal.innerHTML = `
            <div class="prescription-card" style="width: 90%; max-width: 440px; padding: 30px; text-align: left; position: relative; border-radius: 20px;">
                <div style="position: absolute; top: 15px; right: 15px; background: var(--primary); color: #020617; font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Sandbox
                </div>
                
                <h3 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 8px; color: var(--text);">
                    💳 MxK Sandbox Gateway
                </h3>
                
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5;">
                    Live Razorpay key is missing or set to placeholder. Use this simulation gateway to test successful order processing.
                </p>
                
                <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">
                        <span style="color: var(--text-muted);">Bill To:</span>
                        <span style="font-weight: 600;">${escapeHtml(customer.name)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.95rem;">
                        <span style="color: var(--text-muted);">Amount Due:</span>
                        <span style="font-weight: 700; color: var(--primary);">₹${getCartTotal()}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <div class="field" style="margin-bottom: 12px;">
                        <label style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; display: block;">Mock Card Number</label>
                        <input type="text" class="input" value="4111 •••• •••• 4444" disabled style="width: 100%; border-radius: 20px; font-size: 0.85rem; padding: 10px 15px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="field" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; display: block;">Expiry Date</label>
                            <input type="text" class="input" value="12/29" disabled style="width: 100%; border-radius: 20px; font-size: 0.85rem; padding: 10px 15px; text-align: center;">
                        </div>
                        <div class="field" style="margin-bottom: 0;">
                            <label style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; display: block;">CVV</label>
                            <input type="password" class="input" value="123" disabled style="width: 100%; border-radius: 20px; font-size: 0.85rem; padding: 10px 15px; text-align: center;">
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button id="mock-success-btn" class="btn btn-primary" style="width: 100%; border-radius: 30px; padding: 12px; font-size: 0.95rem;">
                        Simulate Successful Payment
                    </button>
                    <button id="mock-cancel-btn" class="btn btn-outline" style="width: 100%; border-radius: 30px; padding: 12px; font-size: 0.95rem; border-color: rgba(244, 63, 94, 0.3); color: var(--error);">
                        Cancel Checkout
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle successful simulation
        document.getElementById("mock-success-btn").addEventListener("click", async () => {
            const successBtn = document.getElementById("mock-success-btn");
            successBtn.setAttribute("disabled", "true");
            successBtn.textContent = "Processing Sandbox Payment...";
            
            try {
                const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        razorpay_order_id: data.razorpayOrderId,
                        razorpay_payment_id: "pay_mock_" + Date.now(),
                        razorpay_signature: "mock_signature",
                        orderId: data.orderId
                    })
                });
                
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok || !verifyData.success) {
                    throw new Error(verifyData.message || "Payment verification failed");
                }
                
                modal.remove();
                showMessage("Simulated payment successful! Thank you for your order.", "success");
                clearCart();
                localStorage.removeItem("saved_prescription");
                
                setTimeout(() => {
                    window.location.replace("home.html");
                }, 2500);
                
            } catch (err) {
                console.error("Mock verification failed", err);
                successBtn.removeAttribute("disabled");
                successBtn.textContent = "Simulate Successful Payment";
                alert(`Sandbox verification failed: ${err.message}`);
            }
        });
        
        // Handle cancel simulation
        document.getElementById("mock-cancel-btn").addEventListener("click", () => {
            modal.remove();
            showMessage("Payment simulation cancelled.", "error");
            payBtn.removeAttribute("disabled");
            payBtn.textContent = "Pay Securely with Razorpay";
        });
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
        
        // Read prescription details from localStorage
        let prescription = null;
        try {
            const presStr = localStorage.getItem("saved_prescription");
            if (presStr) {
                prescription = JSON.parse(presStr);
            }
        } catch (e) {
            console.error("Error reading saved prescription", e);
        }
        
        const payload = {
            cartItems: cart.map(i => ({
                productId: i.productId,
                quantity: i.quantity
            })),
            customer,
            notes: inputNotes.value.trim(),
            prescription
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
            
            // Check if mock / sandbox mode was triggered
            if (data.isMock) {
                openMockPaymentModal(data, customer);
                return;
            }
            
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
                        localStorage.removeItem("saved_prescription");
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
        if (input) input.addEventListener("input", validateForm);
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
    renderPrescription();
    validateForm();
});
