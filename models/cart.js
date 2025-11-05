'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {}
  }

  Cart.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: true
      },
      totalPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'open'
      }
    },
    {
      sequelize,
      modelName: 'Cart',
      tableName: 'carts'
    }
  );

  return Cart;
};
