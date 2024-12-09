const { TransactionItem } = require("../infrastructure/models");

class TransactionItemRepository {
  async bulkCreate(data) {
    return await TransactionItem.bulkCreate(data);
  }
}

module.exports = TransactionItemRepository;
