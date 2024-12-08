const ItemRepository = require("../repositories/itemRepository");
const CategoryRepository = require("../repositories/categoryRepository");
const CreateItem = require("../usecases/createItem");
const ReadItem = require("../usecases/readItem");
const ReadItemById = require("../usecases/readItemById");
const UpdateItem = require("../usecases/updateItem");
const DeleteItem = require("../usecases/deleteItem");

const itemRepository = new ItemRepository();
const categoryRepository = new CategoryRepository();
const Joi = require("joi");

module.exports = {
    async create(req, res) {
        try {
            // validasi request body
            const reqSchema = Joi.object({
                name: Joi.string().required(),
                desc: Joi.string().required(),
                info: Joi.string().required(),
                strikeout_price: Joi.number().required(),
                price: Joi.number().required(),
                stock: Joi.number().required(),
                category_id: Joi.number().required(),
                expiration_date: Joi.date().required(),
                color: Joi.string().required(),
                size: Joi.string().required(),
                model: Joi.string().required(),
            });

            const { error } = reqSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            if (!req.files || req.files.length === 0) {
                console.log(req.files);
                return res.status(400).json({ message: "Please upload image" });
            }

            // cek category_id
            const category = await categoryRepository.getById(req.body.category_id);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }

            const createItem = new CreateItem(itemRepository);
            const imageUrls = req.files.map((file) => file.path);
            const item = await createItem.execute(req.body, imageUrls);
            res.status(201).json({ message: "Item created successfully", item });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    
    async read(req, res) {
        try {
            const { minPrice, maxPrice, startDate, endDate, filterBy, categoryId, search } = req.query;
            const filters = {
                minPrice,
                maxPrice,
                startDate,
                endDate,
                filterBy,
                categoryId,
                search,
            };
            
            const readItem = new ReadItem(itemRepository);
            const items = await readItem.execute(filters);
            res.status(200).json(items);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    async readById(req, res) {
        try {
            const readItemById = new ReadItemById(itemRepository);
            const item = await readItemById.execute(req.params.id);
            res.status(200).json(item);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    
    async update(req, res) {
        try {
            // validasi request body
            const reqSchema = Joi.object({
                name: Joi.string().required(),
                desc: Joi.string().required(),
                info: Joi.string().required(),
                strikeout_price: Joi.number().required(),
                price: Joi.number().required(),
                stock: Joi.number().required(),
                category_id: Joi.number().required(),
                expiration_date: Joi.date().required(),
                color: Joi.string().required(),
                size: Joi.string().required(),
                model: Joi.string().required(),
            });

            const { error } = reqSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            
            // cek category_id
            const category = await categoryRepository.getById(req.body.category_id);
            if (!category) {
                return res.status(404).json({ message: "Category not found" });
            }
            
            const updateItem = new UpdateItem(itemRepository);
            let imageUrls = null;
            if (req.files || req.files.length >= 0) {
                imageUrls = req.files.map((file) => file.path);
            }
            const item = await updateItem.execute(req.params.id, req.body, imageUrls);
            res.status(200).json({ message: "Item updated successfully", item });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    
    async delete(req, res) {
        try {
            const deleteItem = new DeleteItem(itemRepository);
            await deleteItem.execute(req.params.id);
            res.status(200).json({ message: "Item deleted successfully" });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
};
