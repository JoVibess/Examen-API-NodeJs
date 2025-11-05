const express = require('express');
const router = express.Router();

const { User, Cart, CartItem, Product, Order, OrderItem } = require('../models');
const authenticate = require('../middlewares/authenticate');
const logger = require('../middlewares/logger');

router.use(authenticate);
router.use(logger);


// POST /orders
// Valide le panier du user et crée une commande
router.post('/', async (req, res) => {
  try {
    // Chercher le user
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    // Chercher le panier "open"
    const cart = await Cart.findOne({
      where: { userId: user.id, status: 'open' },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    if (!cart || !cart.items.length) {
      return res.status(400).json({ error: 'Panier vide.' });
    }

    if (!cart.deliveryAddress) {
      return res.status(400).json({ error: 'Aucune adresse de livraison dans le panier.' });
    }

    // Calcul du total
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    // Créer la commande
    const order = await Order.create({
      userId: user.id,
      cartId: cart.id,
      totalPrice,
      status: 'validated'
    });

    // Créer les OrderItems et maj stock
    for (const item of cart.items) {
        console.log('MODELS IMPORTÉS:', Object.keys(require('../models')));
      await OrderItem.create({
        orderId: order.id,
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price
      });

      // MAJ stock produit
      item.product.stock -= item.quantity;
      if (item.product.stock < 0) item.product.stock = 0;
      await item.product.save();
    }

    // Fermer le panier
    cart.status = 'closed';
    await cart.save();

    res.json({
      message: 'Commande validée avec succès',
      orderId: order.id,
      totalPrice,
      deliveryAddress: cart.deliveryAddress
    });
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la commande', details: err.message });
  }
});


// GET /orders
// Liste les commandes de l’utilisateur connecté
// Si admin - toutes les commandes
router.get('/', async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['title', 'price'] }]
        },
        { model: Cart, as: 'cart', attributes: ['deliveryAddress'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ orders });
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ error: 'Impossible de récupérer les commandes' });
  }
});

// GET /orders/:id
// Détail d'une commande
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Cart, as: 'cart', attributes: ['deliveryAddress'] }
      ]
    });

    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Accès interdit à cette commande.' });
    }

    res.json({ order });
  } catch (err) {
    console.error('GET /orders/:id error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
});

module.exports = router;
