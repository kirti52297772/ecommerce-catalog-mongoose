const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
app.use(express.json());

mongoose.connect("mongodb+srv://kirtisharma:kirti123@cluster0.rkjhltf.mongodb.net/ecommerceDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ===============================
   STEP 5 → Add Product
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
   STEP 6 → Add Review + Update avgRating
================================= */

app.post("/products/:id/review", async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    const product = await Product.findById(req.params.id);

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
   STEP 7 → Aggregation (Low Stock)
================================= */

app.get("/low-stock", async (req, res) => {
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
});

/* ===============================
   Server Start
================================= */

app.listen(3000, () => {
  console.log("Server running on port 3000");
});