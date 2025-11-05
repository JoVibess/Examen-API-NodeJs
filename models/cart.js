'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {}

  Cart.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('open', 'validated', 'paid', 'shipped', 'completed'),
        defaultValue: 'open',
      },
    },
    {
      sequelize,
      modelName: 'Cart',
    }
  );

  return Cart;
};
