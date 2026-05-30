
document.addEventListener("DOMContentLoaded", () => {
  const products = document.getElementById("products");
  if (!products) return;

  products.innerHTML = `
    <div style="background:#020617;padding:20px;border-radius:10px;">
      <h3>Classic Frame</h3>
      <p>₹1500</p>
      <button style="padding:8px 15px;background:#facc15;border:none;cursor:pointer;">
        Add to Cart
      </button>
    </div>
  `;
});
