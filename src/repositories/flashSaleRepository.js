const { Flashsale } = require('../infrastructure/models');
const { Op } = require('sequelize');

class FlashSaleRepository {
  async create(flashSale) {
    return await Flashsale.create(flashSale);
  }

  async findAllActive() {
    const currentDate = new Date();  // Ambil waktu saat ini
    return await Flashsale.findAll({
      where: {
        start_time: {
          [Op.lte]: currentDate,  // Pastikan start_time <= waktu sekarang
        },
        end_time: {
          [Op.gte]: currentDate,  // Pastikan end_time >= waktu sekarang
        },
      },
      order: [
        ['end_time', 'ASC'],  // Urutkan berdasarkan waktu selesai (terdekat)
        ['start_time', 'ASC'],  // Urutkan berdasarkan waktu mulai (terdekat)
      ],
      include: {
        association: 'item',
        attributes: ['name', 'price', 'rating'],
        include: {
          association: 'images',
          attributes: ['url'],
        },
      },
    });
  }
  

  async findAll() {
    return await Flashsale.findAll();
  }

  async findById(id) {
    return await Flashsale.findByPk(id);
  }

  async update(id, flashSale) {
    return await Flashsale.update(flashSale, { where: { id } });
  }

  async delete(id) {
    return await Flashsale.destroy({ where: { id } });
  }
}

module.exports = FlashSaleRepository;
