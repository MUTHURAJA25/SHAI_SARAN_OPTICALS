// Prescription Page Logic
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("prescription-form");
    const clearBtn = document.getElementById("clear-btn");
    
    // Inputs
    const fields = [
        "dist_od_sph", "dist_od_cyl", "dist_od_axis",
        "dist_os_sph", "dist_os_cyl", "dist_os_axis", "dist_pd",
        "near_od_sph", "near_od_cyl", "near_od_axis",
        "near_os_sph", "near_os_cyl", "near_os_axis", "near_pd"
    ];
    
    const lensTypeSelect = document.getElementById("lens-type");
    const coatingIds = [
        "coat_hard_coat",
        "coat_anti_reflection",
        "coat_blue_cut",
        "coat_photochromatic"
    ];
    
    // Load existing prescription if available
    function loadPrescription() {
        try {
            const dataStr = localStorage.getItem("saved_prescription");
            if (!dataStr) return;
            
            const data = JSON.parse(dataStr);
            
            // Populate patient info
            if (document.getElementById("patient_name") && data.patientName !== undefined) {
                document.getElementById("patient_name").value = data.patientName;
            }
            if (document.getElementById("patient_age") && data.patientAge !== undefined) {
                document.getElementById("patient_age").value = data.patientAge;
            }
            
            // Populate text inputs
            fields.forEach(f => {
                const el = document.getElementById(f);
                if (el && data[f] !== undefined) {
                    el.value = data[f];
                }
            });
            
            // Populate select fields
            if (data.lensType && lensTypeSelect) {
                lensTypeSelect.value = data.lensType;
            }
            if (data.lensIndex && document.getElementById("lens-index")) {
                document.getElementById("lens-index").value = data.lensIndex;
            }
            if (data.lensPrice && document.getElementById("lens-price")) {
                document.getElementById("lens-price").value = data.lensPrice;
            }
            if (data.lensRemarks && document.getElementById("lens-remarks")) {
                document.getElementById("lens-remarks").value = data.lensRemarks;
            }
            
            // Populate checkboxes
            if (data.coatings && Array.isArray(data.coatings)) {
                coatingIds.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.checked = data.coatings.includes(el.value);
                    }
                });
            }
        } catch (e) {
            console.error("Error loading saved prescription", e);
        }
    }
    
    // Clear form fields
    function clearForm() {
        if (document.getElementById("patient_name")) document.getElementById("patient_name").value = "";
        if (document.getElementById("patient_age")) document.getElementById("patient_age").value = "";
        
        fields.forEach(f => {
            const el = document.getElementById(f);
            if (el) el.value = "";
        });
        
        if (lensTypeSelect) {
            lensTypeSelect.selectedIndex = 0;
        }
        if (document.getElementById("lens-index")) {
            document.getElementById("lens-index").selectedIndex = 0;
        }
        if (document.getElementById("lens-price")) {
            document.getElementById("lens-price").value = "";
        }
        if (document.getElementById("lens-remarks")) {
            document.getElementById("lens-remarks").value = "";
        }
        
        coatingIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = false;
        });
        
        showToast("Prescription form cleared");
    }
    
    // Save form data
    function savePrescription(e) {
        e.preventDefault();
        
        const data = {};
        
        // Read patient name & age
        const patientNameEl = document.getElementById("patient_name");
        data.patientName = patientNameEl ? patientNameEl.value.trim() : "";
        const patientAgeEl = document.getElementById("patient_age");
        data.patientAge = patientAgeEl ? parseInt(patientAgeEl.value) || "" : "";
        
        // Read text fields
        fields.forEach(f => {
            const el = document.getElementById(f);
            data[f] = el ? el.value.trim() : "";
        });
        
        // Read lens type select
        data.lensType = lensTypeSelect ? lensTypeSelect.value : "";
        
        if (!data.lensType) {
            alert("Please select a Lens Type");
            if (lensTypeSelect) lensTypeSelect.focus();
            return;
        }
        
        // Read Lens index & price & remarks
        const indexEl = document.getElementById("lens-index");
        data.lensIndex = indexEl ? indexEl.value : "";
        const priceEl = document.getElementById("lens-price");
        data.lensPrice = priceEl ? parseFloat(priceEl.value) || 0 : 0;
        const remarksEl = document.getElementById("lens-remarks");
        data.lensRemarks = remarksEl ? remarksEl.value.trim() : "";
        
        if (!data.lensIndex) {
            alert("Please select a Lens Index");
            if (indexEl) indexEl.focus();
            return;
        }
        if (isNaN(data.lensPrice) || data.lensPrice < 0) {
            alert("Please enter a valid Lens Price");
            if (priceEl) priceEl.focus();
            return;
        }
        
        // Read coatings
        data.coatings = [];
        coatingIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.checked) {
                data.coatings.push(el.value);
            }
        });
        
        try {
            localStorage.setItem("saved_prescription", JSON.stringify(data));
            showToast("Prescription saved successfully!");
            
            // Redirect after brief delay
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get("redirect");
                if (redirect) {
                    window.location.href = redirect;
                } else if (document.referrer && !document.referrer.includes("prescription.html")) {
                    window.location.href = document.referrer;
                } else {
                    window.location.href = "cart.html";
                }
            }, 1000);
            
        } catch (err) {
            console.error("Failed to save prescription", err);
            alert("Error: Failed to save prescription details.");
        }
    }
    
    // Bind events
    if (form) form.addEventListener("submit", savePrescription);
    if (clearBtn) clearBtn.addEventListener("click", clearForm);
    
    // Initialize
    loadPrescription();
});