const { Item, ImageItem, Category } = require("../infrastructure/models");
const { Op } = require("sequelize");

class ItemRepository {
    async create(itemData, imageUrls) {
        const item = await Item.create(itemData);
        const images = imageUrls.map((url) => ({ item_id: item.id, url }));
        await ImageItem.bulkCreate(images);
        return item;
    }
    
    async findAll(filters, order) {
        return await Item.findAll({
            where: filters,
            order: order,  // Menggunakan parameter order yang diberikan
            include: [
                {
                model: ImageItem, // Menginclude ImageItem dalam query
                as: 'images' // Pastikan alias yang sesuai
                },
                {
                model: Category, // Menginclude Category dalam query
                as: 'category' // Pastikan alias yang sesuai
                }
            ]
        });
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
            }
        ] });
    }
    
    async update(id, updateData) {
        return await Item.update(updateData, { where: { id } });
    }
    
    async delete(id) {
        return await Item.destroy({ where: { id } });
    }
}

module.exports = ItemRepository;
