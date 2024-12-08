const { Cart } = require("../infrastructure/models");
const { Op } = require("sequelize");

class CartRepository {
    async save(itemData) {
        return await Cart.create(itemData);
    }
    
    async findAll(filters, order, categoryId, search, take) {
        const where = {};
        const include = [];
        const offset = 0;
        if (categoryId) {
            where.category_id = categoryId;
        }
        if (search) {
            where.name = { [Op.substring]: search };
        }
        return await Cart.findAndCountAll({ where, include, offset, order });
    }

    async findByUserId(userId) {
        return await Cart.findOne({ where: { userId } });
    }
    
    
    async findById(id) {
        return await Item.findByPk(id, { include: [
            {
                model: ImageItem,
                as: 'images'
            },
            {
                model: Category,
                as: 'category'
            },
            {
                model: Flashsale,
                as: 'flashsale',
                attributes: ['id', 'start_time', 'end_time', 'flash_price'],  // Hanya ambil kolom yang dibutuhkan
            }
        ] });
    }
}

module.exports = CartRepository;
