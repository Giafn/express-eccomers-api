const { Transaction } = require("../infrastructure/models");

class TransactionRepository {
  async create(data) {
    return await Transaction.create(data);
  }

  async findById(id) {
    // sama get relasi ke transaction item
    return await Transaction.
      findByPk(id, {
        include: 'transactionItems'
      });
  }

  async findByUserId(userId) {
    return await Transaction.findAll({
      where: {
        user_id: userId
      }
    });
  }

  async update(id, data) {
    return await Transaction.update(data, {
      where: {
        id: id
      }
    });
  }

  async delete(id) {
    return await Transaction.destroy({
      where: {
        id: id
      }
    });
  }
}

module.exports = TransactionRepository;
