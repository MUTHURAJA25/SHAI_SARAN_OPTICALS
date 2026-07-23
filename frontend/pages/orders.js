// Orders Dashboard Logic
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-orders");
    const ordersList = document.getElementById("orders-list");
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");
    const emptyState = document.getElementById("empty-state");

    let allOrders = [];

    // Fetch all orders from backend
    async function fetchOrders() {
        loadingState.style.display = "block";
        errorState.style.display = "none";
        emptyState.style.display = "none";
        ordersList.innerHTML = "";

        try {
            const res = await fetch(`${API_BASE}/api/order`);
            if (!res.ok) throw new Error("Failed to fetch order records");
            
            allOrders = await res.json();
            renderOrders(allOrders);
        } catch (e) {
            console.error("Error loading orders", e);
            errorState.style.display = "block";
            loadingState.style.display = "none";
        }
    }

    // Render orders list
    function renderOrders(orders) {
        loadingState.style.display = "none";
        
        const filterVal = searchInput.value.trim().toLowerCase();
        const filtered = orders.filter(o => {
            if (!filterVal) return true;
            const name = (o.customer && o.customer.name) ? o.customer.name.toLowerCase() : "";
            const phone = (o.customer && o.customer.phone) ? o.customer.phone : "";
            return name.includes(filterVal) || phone.includes(filterVal);
        });

        if (filtered.length === 0) {
            emptyState.style.display = "block";
            ordersList.innerHTML = "";
            return;
        }

        emptyState.style.display = "none";

        ordersList.innerHTML = filtered.map(order => {
            const dateStr = new Date(order.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
            });
            const custName = escapeHtml(order.customer?.name || "N/A");
            const custPhone = escapeHtml(order.customer?.phone || "N/A");
            const custEmail = escapeHtml(order.customer?.email || "N/A");
            const custAddress = escapeHtml(order.customer?.address || "Store Pickup");
            const orderStatus = order.status || "pending";
            const orderNotes = escapeHtml(order.notes || "None");
            
            // Build items HTML
            const itemsHtml = order.items.map(item => `
                <div class="order-item-row">
                    <div>
                        <strong>${escapeHtml(item.name)}</strong> 
                        <span class="product-type" style="margin-left: 8px;">${escapeHtml(item.type)}</span>
                    </div>
                    <div style="color: var(--text-muted);">
                        ${item.quantity} × ₹${item.price} = <span style="color: var(--text); font-weight:600;">₹${item.subtotal}</span>
                    </div>
                </div>
            `).join('');

            // Build prescription details if attached
            let presHtml = "";
            if (order.prescription && order.prescription.lensType) {
                const p = order.prescription;
                
                // Get distance powers safely supporting both schemas
                const od_sph_val = p.dist_od_sph || p.od_sph || "0.00";
                const od_cyl_val = p.dist_od_cyl || p.od_cyl || "0.00";
                const od_axis_val = p.dist_od_axis || p.od_axis || "0";
                const od_va_val = p.dist_od_va || p.od_va || "N/A";
                
                const os_sph_val = p.dist_os_sph || p.os_sph || "0.00";
                const os_cyl_val = p.dist_os_cyl || p.os_cyl || "0.00";
                const os_axis_val = p.dist_os_axis || p.os_axis || "0";
                const os_va_val = p.dist_os_va || p.os_va || "N/A";

                const hasDistancePowers = p.dist_od_sph || p.od_sph || p.dist_os_sph || p.os_sph;
                const hasNearPowers = p.near_od_sph || p.near_os_sph;

                let tablesHtml = "";
                if (hasDistancePowers) {
                    tablesHtml += `
                        <div style="margin-top: 10px;">
                            <strong>Distance Vision Power:</strong>
                            <table class="power-table">
                                <thead>
                                    <tr>
                                        <th>Eye</th>
                                        <th>SPH</th>
                                        <th>CYL</th>
                                        <th>AXIS</th>
                                        <th>VA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>OD (Right)</strong></td>
                                        <td>${escapeHtml(od_sph_val)}</td>
                                        <td>${escapeHtml(od_cyl_val)}</td>
                                        <td>${escapeHtml(od_axis_val)}</td>
                                        <td>${escapeHtml(od_va_val)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>OS (Left)</strong></td>
                                        <td>${escapeHtml(os_sph_val)}</td>
                                        <td>${escapeHtml(os_cyl_val)}</td>
                                        <td>${escapeHtml(os_axis_val)}</td>
                                        <td>${escapeHtml(os_va_val)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                if (hasNearPowers) {
                    tablesHtml += `
                        <div style="margin-top: 15px;">
                            <strong>Near Vision Power:</strong>
                            <table class="power-table">
                                <thead>
                                    <tr>
                                        <th>Eye</th>
                                        <th>SPH</th>
                                        <th>CYL</th>
                                        <th>AXIS</th>
                                        <th>VA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>OD (Right)</strong></td>
                                        <td>${escapeHtml(p.near_od_sph || "+0.00")}</td>
                                        <td>${escapeHtml(p.near_od_cyl || "0.00")}</td>
                                        <td>${escapeHtml(p.near_od_axis || "0")}</td>
                                        <td>${escapeHtml(p.near_od_va || "N/A")}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>OS (Left)</strong></td>
                                        <td>${escapeHtml(p.near_os_sph || "+0.00")}</td>
                                        <td>${escapeHtml(p.near_os_cyl || "0.00")}</td>
                                        <td>${escapeHtml(p.near_os_axis || "0")}</td>
                                        <td>${escapeHtml(p.near_os_va || "N/A")}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                const pdVal = p.dist_pd || p.near_pd || p.pd || "N/A";
                const coatingsHtml = p.coatings && p.coatings.length > 0
                    ? `<div style="margin-top: 10px;">
                        <strong>Coatings & Features:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
                            ${p.coatings.map(c => `<span style="font-size: 0.7rem; padding: 2px 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: var(--success); border-radius: 10px;">✓ ${escapeHtml(c)}</span>`).join('')}
                        </div>
                       </div>`
                    : "";

                presHtml = `
                    <div class="prescription-container">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                            <span style="font-family: var(--font-heading); font-weight:600; color: var(--accent);">🔬 Attached Prescription</span>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">Patient: <strong>${escapeHtml(p.patientName || "N/A")}</strong> ${p.patientAge ? `(${p.patientAge} Yrs)` : ""}</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; font-size: 0.85rem;">
                            <div>Lens Type: <strong>${escapeHtml(p.lensType)}</strong></div>
                            <div>Lens Index: <strong>${escapeHtml(p.lensIndex || "1.56")}</strong> (₹${p.lensPrice || 0})</div>
                            <div>PD: <strong>${escapeHtml(pdVal)} mm</strong></div>
                            <div>Remarks: <strong style="color: var(--text-muted);">${escapeHtml(p.lensRemarks || "None")}</strong></div>
                        </div>
                        ${tablesHtml}
                        ${coatingsHtml}
                    </div>
                `;
            }

            // Razorpay info
            const gatewayHtml = order.razorpay?.paymentId
                ? `<div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 10px; display: flex; flex-wrap: wrap; gap: 15px;">
                     <span>Payment ID: <strong>${escapeHtml(order.razorpay.paymentId)}</strong></span>
                     <span>Razorpay Order: <strong>${escapeHtml(order.razorpay.orderId || "N/A")}</strong></span>
                   </div>`
                : "";

            return `
                <div class="order-card" id="order-${order._id}">
                    <div class="order-header">
                        <div>
                            <span class="order-id">#Order ${order._id.substring(order._id.length - 8).toUpperCase()}</span>
                            <div class="order-date">${dateStr}</div>
                        </div>
                        <div>
                            <span class="order-status status-${orderStatus}">${orderStatus}</span>
                        </div>
                    </div>
                    
                    <div class="order-details-grid">
                        <!-- Customer Column -->
                        <div>
                            <h4 class="order-section-title">Customer Info</h4>
                            <ul class="order-info-list">
                                <li>
                                    <span class="order-info-label">Name</span>
                                    <span class="order-info-value" style="font-weight:600;">${custName}</span>
                                </li>
                                <li>
                                    <span class="order-info-label">Phone</span>
                                    <span class="order-info-value">${custPhone}</span>
                                </li>
                                <li>
                                    <span class="order-info-label">Email</span>
                                    <span class="order-info-value">${custEmail}</span>
                                </li>
                                <li>
                                    <span class="order-info-label">Address</span>
                                    <span class="order-info-value" style="font-size: 0.85rem;">${custAddress}</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Order Summary Column -->
                        <div>
                            <h4 class="order-section-title">Billing Summary</h4>
                            <ul class="order-info-list">
                                <li>
                                    <span class="order-info-label">Currency</span>
                                    <span class="order-info-value">${escapeHtml(order.currency || "INR")}</span>
                                </li>
                                <li>
                                    <span class="order-info-label">Notes</span>
                                    <span class="order-info-value" style="font-size: 0.85rem; color: var(--text-muted);">${orderNotes}</span>
                                </li>
                                <li style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: 8px;">
                                    <span class="order-info-label" style="font-weight:600; color: var(--primary);">Total Paid</span>
                                    <span class="order-info-value" style="font-family: var(--font-heading); font-size:1.3rem; color: var(--primary); font-weight:700;">₹${order.totalAmount}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <h4 class="order-section-title">Ordered Items</h4>
                    <div class="order-items-list">
                        ${itemsHtml}
                    </div>

                    ${presHtml}
                    ${gatewayHtml}
                </div>
            `;
        }).join('');
    }

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

    // Setup search filter listener
    searchInput.addEventListener("input", () => {
        renderOrders(allOrders);
    });

    // Initial fetch
    fetchOrders();
});
