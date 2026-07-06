// Product Upload Page Logic
document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("frame-upload-form");
    const dropzone = document.getElementById("image-dropzone");
    const fileInput = document.getElementById("product-image-file");
    const dropzoneText = document.getElementById("dropzone-text");
    const previewContainer = document.getElementById("image-preview-container");
    const previewImage = document.getElementById("image-preview");
    const deletePreviewBtn = document.getElementById("delete-preview-btn");
    
    const sessionCount = document.getElementById("session-count");
    const progressBarFill = document.getElementById("progress-bar-fill");
    const uploadedList = document.getElementById("uploaded-list");
    const emptyHistoryText = document.getElementById("empty-history-text");

    const productTypeSelect = document.getElementById("product-type");
    const frameAttrsSection = document.getElementById("frame-attrs-section");
    const lensAttrsSection = document.getElementById("lens-attrs-section");
    const contactLensAttrsSection = document.getElementById("contact-lens-attrs-section");

    const uploadSectionTitle = document.getElementById("upload-section-title");
    const productNameLabel = document.getElementById("product-name-label");
    const productImageLabel = document.getElementById("product-image-label");
    
    let uploadedCount = 0;
    const targetGoal = 100;
    let base64Image = "";

    // Handle type change
    productTypeSelect.addEventListener("change", () => {
        const selectedType = productTypeSelect.value;
        
        // Hide sections
        frameAttrsSection.style.display = "none";
        lensAttrsSection.style.display = "none";
        contactLensAttrsSection.style.display = "none";

        // Remove required constraints
        document.getElementById("product-model-number").required = false;
        document.getElementById("product-size").required = false;
        document.getElementById("product-lens-type").required = false;

        if (selectedType === "frame") {
            frameAttrsSection.style.display = "block";
            document.getElementById("product-model-number").required = true;
            document.getElementById("product-size").required = true;

            uploadSectionTitle.textContent = "Upload New Frame";
            productNameLabel.textContent = "Frame Name *";
            productImageLabel.textContent = "Frame Photo *";
            document.getElementById("submit-btn").textContent = "🚀 Upload Frame";
        } else if (selectedType === "lens") {
            lensAttrsSection.style.display = "block";
            document.getElementById("product-lens-type").required = true;

            uploadSectionTitle.textContent = "Upload New Prescription Lens";
            productNameLabel.textContent = "Lens Name *";
            productImageLabel.textContent = "Lens Photo *";
            document.getElementById("submit-btn").textContent = "🚀 Upload Lens";
        } else if (selectedType === "contact-lens") {
            contactLensAttrsSection.style.display = "block";

            uploadSectionTitle.textContent = "Upload New Contact Lens";
            productNameLabel.textContent = "Contact Lens Name *";
            productImageLabel.textContent = "Contact Lens Photo *";
            document.getElementById("submit-btn").textContent = "🚀 Upload Contact Lens";
        }
    });
    
    // DRAG AND DROP FILE HANDLERS
    dropzone.addEventListener("click", () => {
        // Only trigger if no image is currently selected
        if (!base64Image) {
            fileInput.click();
        }
    });
    
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });
    
    ["dragleave", "drop"].forEach(event => {
        dropzone.addEventListener(event, () => {
            dropzone.classList.remove("dragover");
        });
    });
    
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });
    
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    function handleFileSelection(file) {
        if (!file.type.startsWith("image/")) {
            showToast("Error: Please select an image file (PNG/JPG/JPEG).");
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB Limit
            showToast("Error: Image size should be less than 5MB.");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            base64Image = e.target.result;
            previewImage.src = base64Image;
            dropzoneText.style.display = "none";
            previewContainer.style.display = "flex";
            fileInput.required = false; // We already have the image stored
        };
        reader.onerror = () => {
            showToast("Error reading file.");
        };
        reader.readAsDataURL(file);
    }
    
    // REMOVE PREVIEW IMAGE
    deletePreviewBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Avoid triggering dropzone click
        resetImageState();
    });
    
    function resetImageState() {
        base64Image = "";
        previewImage.src = "";
        previewContainer.style.display = "none";
        dropzoneText.style.display = "flex";
        fileInput.value = "";
        fileInput.required = true;
    }
    
    // FORM SUBMISSION HANDLER
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const type = productTypeSelect.value;
        
        if (!base64Image) {
            showToast(`Please upload a product image.`);
            return;
        }
        
        const name = document.getElementById("product-name").value.trim();
        const brand = document.getElementById("product-brand").value.trim() || "MxK Opticals";
        const price = parseFloat(document.getElementById("product-price").value);
        const description = document.getElementById("product-description").value.trim();
        
        const attributes = {};
        if (type === "frame") {
            attributes.size = document.getElementById("product-size").value;
            attributes.modelNumber = document.getElementById("product-model-number").value.trim();
            attributes.color = document.getElementById("product-color").value.trim();
            attributes.material = document.getElementById("product-material").value.trim();
            attributes.shape = document.getElementById("product-shape").value.trim();
        } else if (type === "lens") {
            attributes.lensType = document.getElementById("product-lens-type").value;
            attributes.powerRange = document.getElementById("product-lens-power-range").value.trim();
            attributes.material = document.getElementById("product-lens-material").value.trim();
            attributes.diameter = document.getElementById("product-lens-diameter").value.trim();
        } else if (type === "contact-lens") {
            attributes.powerRange = document.getElementById("product-contact-power-range").value.trim();
            attributes.baseCurve = document.getElementById("product-contact-base-curve").value.trim();
            attributes.diameter = document.getElementById("product-contact-diameter").value.trim();
        }
        
        // Construct the product payload matching our backend Mongoose model
        const payload = {
            name,
            type,
            brand,
            price,
            description,
            images: [base64Image],
            stock: 20, // Default stock for new products
            attributes
        };
        
        const submitBtn = document.getElementById("submit-btn");
        submitBtn.disabled = true;
        const uploadTypeLabel = type === "frame" ? "Frame" : (type === "lens" ? "Lens" : "Contact Lens");
        submitBtn.innerHTML = `<span>⏳ Uploading ${uploadTypeLabel}...</span>`;
        
        try {
            const res = await fetch(`${API_BASE}/api/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to save ${type}`);
            }
            
            const savedProduct = await res.json();
            
            // Handle success
            uploadedCount++;
            updateProgress();
            addHistoryCard(savedProduct);
            
            showToast(`Uploaded ${uploadTypeLabel}: ${name}`);
            
            // Reset form inputs except brand name for speed/convenience
            document.getElementById("product-name").value = "";
            document.getElementById("product-price").value = "";
            document.getElementById("product-description").value = "";
            
            // Frame fields reset
            document.getElementById("product-model-number").value = "";
            document.getElementById("product-color").value = "";
            document.getElementById("product-material").value = "";
            document.getElementById("product-shape").value = "";
            
            // Lens fields reset
            document.getElementById("product-lens-type").selectedIndex = 0;
            document.getElementById("product-lens-power-range").value = "";
            document.getElementById("product-lens-material").value = "";
            document.getElementById("product-lens-diameter").value = "";
            
            // Contact Lens fields reset
            document.getElementById("product-contact-power-range").value = "";
            document.getElementById("product-contact-base-curve").value = "";
            document.getElementById("product-contact-diameter").value = "";
            
            resetImageState();
            
        } catch (err) {
            console.error("Upload Error:", err);
            showToast(`Upload Failed: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `🚀 Upload ${uploadTypeLabel}`;
        }
    });
    
    // UPDATE UPLOAD PROGRESS
    function updateProgress() {
        sessionCount.textContent = `${uploadedCount} / ${targetGoal}`;
        
        // Calculate progress percentage capped at 100
        const percentage = Math.min((uploadedCount / targetGoal) * 100, 100);
        progressBarFill.style.width = `${percentage}%`;
        
        if (uploadedCount === targetGoal) {
            progressBarFill.style.background = "var(--success)";
            showToast("🎉 Congratulations! You have uploaded 100 frames!");
        }
    }
    
    // ADD CARD TO RECENT UPLOADS PANEL
    function addHistoryCard(product) {
        if (emptyHistoryText) {
            emptyHistoryText.remove();
        }
        
        const attr = product.attributes || {};
        const card = document.createElement("div");
        card.className = "history-card";
        
        let metaHtml = "";
        if (product.type === "frame") {
            metaHtml = `
                <span>Model: <strong>${escapeHtml(attr.modelNumber || "N/A")}</strong></span>
                <span>Size: <strong>${escapeHtml(attr.size || "N/A")}</strong></span>
            `;
        } else if (product.type === "lens") {
            metaHtml = `
                <span>Design: <strong>${escapeHtml(attr.lensType || "N/A")}</strong></span>
                <span>Range: <strong>${escapeHtml(attr.powerRange || "N/A")}</strong></span>
            `;
        } else if (product.type === "contact-lens") {
            metaHtml = `
                <span>BC: <strong>${escapeHtml(attr.baseCurve || "N/A")}</strong></span>
                <span>DIA: <strong>${escapeHtml(attr.diameter || "N/A")}</strong></span>
            `;
        } else {
            metaHtml = `
                <span>Price: <strong>₹${product.price}</strong></span>
            `;
        }
        
        card.innerHTML = `
            <img class="history-card-thumb" src="${product.images[0]}" alt="${product.name}">
            <div class="history-card-details">
                <div class="history-card-name">${escapeHtml(product.name)}</div>
                <div class="history-card-meta">
                    ${metaHtml}
                </div>
            </div>
            <a href="product-detail.html?id=${product._id}" class="history-card-view-btn" target="_blank" title="View Product Page">🔗</a>
        `;
        
        // Insert at the top of the history list
        uploadedList.insertBefore(card, uploadedList.firstChild);
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
});
