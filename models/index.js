'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Charger automatiquement tous les modèles
fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Définition des associations
const { User, Product, Tag, Cart, CartItem } = db;

// --- Relations User ---
User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Relations Product <-> Tag (N-N) ---
Product.belongsToMany(Tag, { through: 'ProductTags', foreignKey: 'productId', otherKey: 'tagId', as: 'tags' });
Tag.belongsToMany(Product, { through: 'ProductTags', foreignKey: 'tagId', otherKey: 'productId', as: 'products' });

// --- Relations Cart <-> CartItem (1-N) ---
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// --- Relations Product <-> CartItem (1-N) ---
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
