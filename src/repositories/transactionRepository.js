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
        userId: userId
      },
      attributes: ['id', 'status', 'orderID', 'payment_method', 'payment_url', 'amount', 'address', 'total_amount'],
      include: {
        association: 'transactionItems',
        attributes: ['qty', 'amount', "items_id"],
        include: {
          association: 'cartItem',
          attributes: ['item_id'],
          include: {
            association: 'item',
            attributes: ['name'],
            include: {
              association: 'images',
              attributes: ['url']
            }
          }
        }
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

  async updateStatus(id, status) {
    return await Transaction.update({
      status: status
    }, {
      where: {
        id: id
      }
    });
  }
}

module.exports = TransactionRepository;
