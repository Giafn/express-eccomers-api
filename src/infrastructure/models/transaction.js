'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction.init({
    status: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    payment_url: DataTypes.STRING,
    voucher_id: DataTypes.INTEGER,
    amount: DataTypes.FLOAT,
    total_amount: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};