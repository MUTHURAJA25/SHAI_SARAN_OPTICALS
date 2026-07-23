const Product = require("../models/Product");

async function seedDatabase() {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log("Database already seeded with products.");
      return;
    }

    const sampleProducts = [
      {
        name: "Classic Tortoise Round Frame",
        type: "frame",
        brand: "Ray-Ban",
        price: 1299,
        description: "Timeless tortoise-shell design crafted from high-grade acetate. Lightweight, durable, and highly stylish.",
        images: ["https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80"],
        stock: 50,
        attributes: {
          size: "Medium",
          color: "Tortoise",
          material: "Acetate",
          shape: "Round",
          modelNumber: "RB-2026"
        },
        isActive: true
      },
      {
        name: "Aviator Premium Metallic Frame",
        type: "frame",
        brand: "Carrera",
        price: 2499,
        description: "Classic aviator profile with a sturdy metallic double-bridge structure. Perfect for casual and semi-formal wear.",
        images: ["https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80"],
        stock: 35,
        attributes: {
          size: "Large",
          color: "Gold/Black",
          material: "Metal",
          shape: "Aviator",
          modelNumber: "CR-991"
        },
        isActive: true
      },
      {
        name: "Matte Black Square Lite Frame",
        type: "frame",
        brand: "Oakley",
        price: 999,
        description: "Sleek and sporty matte black square frame designed for high comfort and day-long wearability.",
        images: ["https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80"],
        stock: 40,
        attributes: {
          size: "Medium",
          color: "Matte Black",
          material: "TR90 Flexible Plastic",
          shape: "Square",
          modelNumber: "OK-404"
        },
        isActive: true
      },
      {
        name: "Premium Blue-Cut Protection Lens",
        type: "lens",
        brand: "Essilor",
        price: 799,
        description: "Advanced blue-light filtering lens protecting your eyes from screen glare, digital fatigue, and UV radiation.",
        images: ["https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80"],
        stock: 100,
        attributes: {
          lensType: "Single Vision",
          powerRange: "-8.00 to +6.00",
          material: "Polycarbonate",
          diameter: "70mm"
        },
        isActive: true
      },
      {
        name: "Anti-Glare Crizal Pristine Lens",
        type: "lens",
        brand: "Crizal",
        price: 1499,
        description: "Superior anti-reflective coatings offering smudge-resistance, water-repellence, and scratch protection with pristine optical clarity.",
        images: ["https://images.unsplash.com/photo-1590650213165-c1fef80648c4?auto=format&fit=crop&w=600&q=80"],
        stock: 80,
        attributes: {
          lensType: "Single Vision",
          powerRange: "-10.00 to +8.00",
          material: "High Index 1.61 Plastic",
          diameter: "72mm"
        },
        isActive: true
      },
      {
        name: "Acuvue Moist Daily Contact Lenses",
        type: "contact-lens",
        brand: "Johnson & Johnson",
        price: 1899,
        description: "Daily disposable contact lenses featuring Lacreon technology for long-lasting moisture and comfort. Box of 30 lenses.",
        images: ["https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80"],
        stock: 60,
        attributes: {
          powerRange: "-0.50 to -12.00",
          baseCurve: "8.5mm",
          diameter: "14.2mm"
        },
        isActive: true
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log("Successfully seeded database with sample products!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

module.exports = seedDatabase;
