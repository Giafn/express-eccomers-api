class UpdateItem {
    constructor(itemRepository) {
      this.itemRepository = itemRepository;
    }
  
    async execute(id, updateData) {
      return await this.itemRepository.update(id, updateData);
    }
  }
  
  module.exports = UpdateItem;
  