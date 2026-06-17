// Frame Upload Page Logic
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
    
    let uploadedCount = 0;
    const targetGoal = 100;
    let base64Image = "";
    
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
        
        if (!base64Image) {
            showToast("Please upload a frame image.");
            return;
        }
        
        const name = document.getElementById("product-name").value.trim();
        const brand = document.getElementById("product-brand").value.trim() || "MxK Opticals";
        const price = parseFloat(document.getElementById("product-price").value);
        const size = document.getElementById("product-size").value;
        const modelNumber = document.getElementById("product-model-number").value.trim();
        const color = document.getElementById("product-color").value.trim();
        const material = document.getElementById("product-material").value.trim();
        const shape = document.getElementById("product-shape").value.trim();
        const description = document.getElementById("product-description").value.trim();
        
        // Construct the product payload matching our backend Mongoose model
        const payload = {
            name,
            type: "frame",
            brand,
            price,
            description,
            images: [base64Image],
            stock: 20, // Default stock for new frames
            attributes: {
                size,
                color,
                material,
                shape,
                modelNumber
            }
        };
        
        const submitBtn = document.getElementById("submit-btn");
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳ Uploading Frame...</span>`;
        
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
                throw new Error(errorData.message || "Failed to save frame");
            }
            
            const savedProduct = await res.json();
            
            // Handle success
            uploadedCount++;
            updateProgress();
            addHistoryCard(savedProduct);
            
            showToast(`Uploaded frame: ${name}`);
            
            // Reset form inputs except brand name for speed/convenience
            document.getElementById("product-name").value = "";
            document.getElementById("product-price").value = "";
            document.getElementById("product-model-number").value = "";
            document.getElementById("product-color").value = "";
            document.getElementById("product-material").value = "";
            document.getElementById("product-shape").value = "";
            document.getElementById("product-description").value = "";
            resetImageState();
            
        } catch (err) {
            console.error("Upload Error:", err);
            showToast(`Upload Failed: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `🚀 Upload Frame`;
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
        
        card.innerHTML = `
            <img class="history-card-thumb" src="${product.images[0]}" alt="${product.name}">
            <div class="history-card-details">
                <div class="history-card-name">${escapeHtml(product.name)}</div>
                <div class="history-card-meta">
                    <span>Model: <strong>${escapeHtml(attr.modelNumber || "N/A")}</strong></span>
                    <span>Size: <strong>${escapeHtml(attr.size || "N/A")}</strong></span>
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
