const CategoryRepository = require("../repositories/categoryRepository");
const GetAllCategory = require("../usecases/getAllCategory");

const categoryRepository = new CategoryRepository();

module.exports = {
    async getAll(req, res) {
        try {
        const getAllCategory = new GetAllCategory({ categoryRepository });
        const categories = await getAllCategory.execute();
        res.status(200).json({ categories });
        } catch (err) {
        res.status(400).json({ message: err.message });
        }
    },
};
