const { CartItem } = require("../infrastructure/models");
const { Op } = require("sequelize");

class CartItemRepository {
    async addCartItem(cartId, itemId, qty) {
        return await CartItem.create(
            {
                cart_id: cartId,
                item_id: itemId,
                qty: qty,
            },
            { returning: true }
        );
    }

    // update qty of cart item
    async updateCartItem(cartItemId, qty) {
        return await CartItem.update(
            {
                qty: qty,
            },
            {
                where: {
                    id: cartItemId,
                },
                returning: true,
            }
        );
    }

    async getCartItemByCartItemId(cartItemId) {
        return await CartItem.findByPk(cartItemId, {
            include: {
                association: "item",
                attributes: ["id", "stock"],
            },
        });
    }

    // get cart item by cart id and item id
    async getCartItemByCartIdAndItemId(cartId, itemId) {
        return await CartItem.findOne({
            where: {
                [Op.and]: [{ cart_id: cartId }, { item_id: itemId }],
            },
        });
    }

    async getCartItemsByCartId(cartId) {
        return await CartItem.findAll({
            where: {
                cart_id: cartId,
            },
            include: {
                association: "item",
                attributes: ["name", "price"],
            }
        });
    }

    // findById
    async findById(id) {
        return await CartItem.findByPk(id);
    }

    // delete cart item
    async deleteCartItem(id) {
        return await CartItem.destroy({
            where: {
                id: id,
            },
        });
    }

    // delete cart by item id
    async deleteCartItemByItemId(itemId) {
        return await CartItem.destroy({
            where: {
                item_id: itemId,
            },
        });
    }
}

module.exports = CartItemRepository;
