'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

// Initialisation de Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// --- Chargement automatique de tous les modèles ---
fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// --- Vérifie les modèles disponibles ---
const { User, Product, Tag, Cart, CartItem, Order, OrderItem } = db;

// --- User <-> Cart (1-N)
if (User && Cart) {
  User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });
  Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
}

// --- Product <-> Tag (N-N)
if (Product && Tag) {
  Product.belongsToMany(Tag, {
    through: 'ProductTags',
    foreignKey: 'productId',
    otherKey: 'tagId',
    as: 'tags'
  });
  Tag.belongsToMany(Product, {
    through: 'ProductTags',
    foreignKey: 'tagId',
    otherKey: 'productId',
    as: 'products'
  });
}

// --- Cart <-> CartItem (1-N)
if (Cart && CartItem) {
  Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
  CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
}

// --- Product <-> CartItem (1-N)
if (Product && CartItem) {
  Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
  CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
}

// --- User <-> Order (1-N)
if (User && Order) {
  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
}

// --- Cart <-> Order (1-1)
if (Cart && Order) {
  Cart.hasOne(Order, { foreignKey: 'cartId', as: 'order' });
  Order.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
}

// --- Order <-> OrderItem (1-N)
if (Order && OrderItem) {
  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
}

// --- Product <-> OrderItem (1-N)
if (Product && OrderItem) {
  Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
}

// --- Export final ---
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;