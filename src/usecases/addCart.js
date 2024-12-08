class AddCart {
  constructor({ cartRepository }) {
    this.cartRepository = cartRepository;
  }

  async execute({ userId, itemId, qty , amount_per_item, amount, total}) {
    return this.cartRepository.save({ 
      user_id: userId, 
      item_id: itemId, 
      qty: qty, 
      amount_per_item: 0, 
      amount: 0, 
      total: 0
     });
  }
}

module.exports = AddCart;
  