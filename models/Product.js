const mongoose = require("mongoose");

// Variant Schema (Nested)
const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  color: String,
  price: Number,
  stock: { type: Number, default: 0 }
});

// Review Schema (Nested)
const reviewSchema = new mongoose.Schema({
  userId: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String
});

// Main Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  variants: [variantSchema],  // Nested array
  reviews: [reviewSchema],    // Nested array
  avgRating: { type: Number, default: 0 }
}, { timestamps: true });

// Index for performance
productSchema.index({ category: 1 });
productSchema.index({ "variants.sku": 1 });

module.exports = mongoose.model("Product", productSchema);