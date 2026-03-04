const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
app.use(express.json());

// Use environment variable for MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Root route (for live demo check)
app.get("/", (req, res) => {
  res.send("E-commerce Catalog API is Live 🚀");
});

/* ===============================
   Add Product
================================= */
app.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ===============================
   Add Review + Update avgRating
================================= */
app.post("/products/:id/review", async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.reviews.push({ rating, comment, userId });

    const total = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.avgRating = total / product.reviews.length;

    await product.save();
    res.json(product);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ===============================
   Aggregation → Low Stock
================================= */
app.get("/low-stock", async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $unwind: "$variants" },
      { $match: { "variants.stock": { $lt: 10 } } },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          lowStockVariants: { $push: "$variants" }
        }
      }
    ]);

    res.json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ===============================
   Server Start
================================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
