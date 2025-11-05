const express = require("express");
const router = express.Router();

const { Cart, CartItem, Product } = require("../models");
const authenticate = require("../middlewares/authenticate");
const logger = require("../middlewares/logger");

// Middleware global
router.use(authenticate);
router.use(logger);

// GET /cart - panier courant (status: 'open')
router.get("/", async (req, res) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.id, status: "open" },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "price"],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        status: "open",
        totalPrice: 0,
      });
    }

    res.json({ cart });
  } catch (err) {
    console.error("GET /cart error:", err);
    res
      .status(500)
      .json({ error: "Unable to fetch cart", details: err.message });
  }
});

// POST /cart - Ajouter un produit au panier
router.post("/", async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Invalid product or quantity" });
  }

  try {
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Trouve un panier OPEN sinon crée un nouveau
    let cart = await Cart.findOne({
      where: { userId: req.user.id, status: "open" },
    });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        status: "open",
        totalPrice: 0,
      });
    }

    // Suite inchangée
    let item = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        unitPrice: product.price,
      });
    }

    const updated = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    res.json({ message: "Product added to cart", cart: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to add product to cart" });
  }
});

// PUT /cart/:productId - Modifier la quantité d’un produit
router.put("/:productId", async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!item) return res.status(404).json({ error: "Item not found" });

    item.quantity = quantity;
    await item.save();

    res.json({ message: "Quantity updated", item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to update quantity" });
  }
});

// DELETE /cart/:productId - Supprimer un produit du panier
router.delete("/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!item) return res.status(404).json({ error: "Item not found" });

    await item.destroy();
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to remove item" });
  }
});

// DELETE /cart - Vider le panier
router.delete("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ message: "Cart emptied" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to empty cart" });
  }
});

module.exports = router;
