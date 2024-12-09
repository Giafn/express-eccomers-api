const CartRepository = require('../repositories/cartRepository');
const CartItemRepository = require('../repositories/cartItemRepository');
const ItemRepository = require("../repositories/itemRepository");
const AddToCart = require("../usecases/cart/addToCart");
const UpdateCartItemQty = require("../usecases/cart/updateCartItemQty");
const Joi = require("joi");
const updateCartItemQty = require('../usecases/cart/updateCartItemQty');

const cartRepository = new CartRepository();
const cartItemRepository = new CartItemRepository();
const itemRepository = new ItemRepository();

module.exports = {
    async addToCart(req, res) {
        try {
            // Validasi request body
            const reqSchema = Joi.object({
                item_id: Joi.number().required(),
                qty: Joi.number().min(1).required(),
            });

            const { error } = reqSchema.validate(req.body);
            if (error) {
                return res.status(400).json(
                    {
                        "status": "invalid_request",
                        "message": error.message
                    }
                );
            }

            const userId = req.user.id;
            const { item_id, qty } = req.body;

            // Cek apakah item_id valid
            const item = await itemRepository.findById(item_id);
            if (!item) {
                return res.status(404).json(
                    {
                        "status": "not_found",
                        "message": "Item not found"
                    }
                );
            }

            // cek jika cart belum ada, maka buat cart baru
            let cart = await cartRepository.getCartByUserId(userId);
            if (!cart) {
                cart = await cartRepository.createCart(userId);
            }

            // cek jika item sudah ada di cart
            const cartItem = await cartItemRepository.getCartItemByCartIdAndItemId(cart.id, item_id);
            if (cartItem) {
                let updateCartItemQty = new UpdateCartItemQty({cartItemRepository});
                updateCartItemQty = await updateCartItemQty.execute(cartItem.id, cartItem.qty + qty);
                return res.json(
                    {
                        "status": "success",
                        "message": "Item added to cart successfully",
                    }
                );
            }

            // Tambahkan item ke cart
            let addToCart = new AddToCart({cartItemRepository});
            addToCart = await addToCart.execute(cart.id, item_id, qty);

            return res.json({ 
                "status": "success",
                "message": "Item added to cart successfully",
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                "status": "internal_error",
                "message": "Internal server error"
             });
        }
    },
    async getCart(req, res) {
        try {
            const userId = req.user.id;
            const cart = await cartRepository.getCartByUserId(userId);

            if (!cart) {
                return res.status(404).json(
                    {
                        "status": "not_found",
                        "message": "Cart not found"
                    }
                );
            }

            return res.json(
                {
                    "status": "success",
                    "data": cart
                }
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                "status": "internal_error",
                "message": "Internal server error"
             });
        }
    },
    async updateCartItemQty(req, res) {
        try {
            // Validasi request body
            const reqSchema = Joi.object({
                cartItemId: Joi.number().required(),
                qty: Joi.number().min(1).required(),
            });

            const { error } = reqSchema.validate(req.body);
            if (error) {
                return res.status(400).json(
                    {
                        "status": "invalid_request",
                        "message": error.message
                    }
                );
            }

            const userId = req.user.id;
            const { cartItemId, qty } = req.body;

            // Cek apakah cart item valid
            const cartItem = await cartItemRepository.findById(cartItemId);
            if (!cartItem) {
                return res.status(404).json(
                    {
                        "status": "not_found",
                        "message": "Cart item not found"
                    }
                );
            }

            const cart = await cartRepository.getCartByUserId(userId);
            if (!cart) {
                return res.status(404).json(
                    {
                        "status": "not_found",
                        "message": "Cart not found"
                    }
                );
            }

            if (cartItem.cart_id !== cart.id) {
                return res.status(403).json(
                    {
                        "status": "forbidden",
                        "message": "Forbidden"
                    }
                );
            }

            // Update qty cart item
            let updateCartItemQty = new UpdateCartItemQty({cartItemRepository});
            updateCartItemQty = await updateCartItemQty.execute(cartItemId, qty);

            return res.json(
                {
                    "status": "success",
                    "message": "Cart item updated successfully"
                }
            );
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                "status": "internal_error",
                "message": "Internal server error",
                "hint": error.message
             });
        }
    },
    // fungsi untuk mendapatkan nominal total harga dari cart item
    async getTotalPrice(req, res) {
        try {
            const userId = req.user.id;
            const cartItemId = req.params.cartItemId;

            const cartItem = await cartItemRepository.findById(cartItemId);
            if (!cartItem) {
                return res.status(404).json(
                    {
                        "status": "not_found",
                        "message": "Cart item not found"
                    }
                );
            }

            const cart = await cartRepository.getCartByUserId(userId);
            if (!cart) {
                return res.status(404).json(
                    {
                        "status": "not_found",
                        "message": "Cart not found"
                    }
                );
            }

            if (cartItem.cart_id !== cart.id) {
                return res.status(403).json(
                    {
                        "status": "forbidden",
                        "message": "Forbidden"
                    }
                );
            }

            const item = await itemRepository.findById(cartItem.item_id);
            if (!item) {
                return res.status(404).json(
                    {
                        "status": "not_found",
                        "message": "Item not found"
                    }
                );
            }

            // cek apakah ada flash sale
            const flashSale = item.flashsale.length > 0 ? item.flashsale[0] : null;
            if (flashSale) {
                const now = new Date();
                item.price = flashSale.flash_price;
            }

            item.qty = cartItem.qty;
            item.total_price = item.price * item.qty;

            return res.json(
                {
                    "status": "success",
                    "data": {
                        "total_price": item.total_price,
                        "is_flash_sale": flashSale ? true : false,
                    }
                }
            );

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                "status": "internal_error",
                "message": "Internal server error"
             });
        }
    }

};
