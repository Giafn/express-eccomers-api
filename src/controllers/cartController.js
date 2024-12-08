const CartRepository = require('../repositories/cartRepository');
const ItemRepository = require("../repositories/itemRepository");
const AddCart = require("../usecases/addCart");
const Joi = require("joi");

const cartRepository = new CartRepository();
const itemRepository = new ItemRepository();

module.exports = {
    async create(req, res) {
        try {
            // Validasi request body
            const reqSchema = Joi.object({
                item_id: Joi.number().required(),
                qty: Joi.number().min(1).required(),
            });

            const { error } = reqSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            // Cek item_id dan ambil data item termasuk flash sale
            const item = await itemRepository.findById(req.body.item_id, { include: ['flashsale'] });
            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }

            // Cek stok item
            if (item.stock < req.body.qty) {
                return res.status(400).json({ message: "Item out of stock" });
            }

            // Hitung harga berdasarkan flash sale jika ada
            let harga = item.price; // Harga default adalah harga normal
            const now = new Date();

            // Periksa apakah ada flash sale yang berlaku
            if (item.flashsale && Array.isArray(item.flashsale) && item.flashsale.length > 0) {
                const flashSale = item.flashsale.find(
                    (sale) => now >= new Date(sale.start_time) && now <= new Date(sale.end_time)
                );

                if (flashSale) {
                    harga = flashSale.flash_price; // Gunakan harga flash sale
                }
            }

            // Simpan item ke keranjang
            const createCart = new AddCart({ cartRepository });
            const cartItem = await createCart.execute({
                userId: req.user.id,
                itemId: req.body.item_id,
                qty: req.body.qty,
                amount_per_item: harga,
                amount: harga * req.body.qty,
                total: harga * req.body.qty,
            });

            return res.status(201).json(cartItem);
        } catch (err) {
            console.error(err); // Debugging error
            return res.status(500).json({ message: "Internal server error" });
        }
    },
};
