class ReadItem {
    constructor(itemRepository) {
      this.itemRepository = itemRepository;
    }
  
    async execute(filters) {
      const { filterBy } = filters;
      let order = [];
  
      // Tentukan urutan berdasarkan filterBy
      if (filterBy === "date_desc") {
        order = [["createdAt", "DESC"]];
      } else if (filterBy === "date_asc") {
        order = [["createdAt", "ASC"]];
      } else if (filterBy === "price_asc") {
        order = [["price", "ASC"]];
      } else if (filterBy === "price_desc") {
        order = [["price", "DESC"]];
      }
  
      // Tentukan filter berdasarkan harga dan tanggal jika ada
      const where = {};
      if (filters.minPrice) where.price = { [Op.gte]: filters.minPrice };
      if (filters.maxPrice) where.price = { ...where.price, [Op.lte]: filters.maxPrice };
      if (filters.startDate) where.createdAt = { [Op.gte]: filters.startDate };
      if (filters.endDate) where.createdAt = { ...where.createdAt, [Op.lte]: filters.endDate };
  
      return await this.itemRepository.findAll(where, order);
    }
  }
  
  module.exports = ReadItem;
  