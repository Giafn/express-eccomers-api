const TransactionRepository = require('../repositories/transactionRepository');
const TransactionItemRepository = require('../repositories/transactionItemRepository');
const cartRepository = require('../repositories/cartRepository');
const cartItemRepository = require('../repositories/cartItemRepository');
const itemRepository = require('../repositories/itemRepository');

const createTransaction = require('../usecases/transaction/createTransaction');
const createTransactionItems = require('../usecases/transaction/createTransactionItems');

const { createQrisInvoice, checkPaymentStatus } = require("../utils/midtransHelper");

const Joi = require("joi");
const { check } = require('express-validator');

module.exports = {
    async create(req, res) {
        try {
            const reqSchema = Joi.object({
                voucher_id: Joi.number(),
                address: Joi.string().required(),
                total_amount: Joi.number().required(),
                items: Joi.array().items(Joi.object({
                    items_id: Joi.number().required(),
                    qty: Joi.number().required(),
                    amount: Joi.number().required()
                })).required().min(1)
            });

            const { error } = reqSchema.validate(req.body);

            if (error) {
                res.status(400).json({
                    "status": "error",
                    "message": error.message
                });
            }

            // cek apakah items_id valid
            const cartItemRepo = new cartItemRepository();
            let cartId;
            req.body.items.forEach(async item => {
                if (item.items_id < 1) {
                    res.status(400).json({
                        "status": "error",
                        "message": "items_id must be greater than 0"
                    });
                }
                itemCheck = await cartItemRepo.getCartItemByCartItemId(item.items_id);
                if (!itemCheck) {
                    res.status(400).json({
                        "status": "error",
                        "message": "items_id not found"
                    });
                }
                
                cartId = itemCheck.cart_id;

                if (itemCheck.item.stock < item.qty) {
                    res.status(400).json({
                        "status": "error",
                        "message": "stock is not enough"
                    });
                }
            });

            // cek cart apakah miliknya
            const user = req.user;
            const cartRepo = new cartRepository();
            const cart = await cartRepo.getCartByUserId(user.id);

            if (!cart) {
                res.status(400).json({
                    "status": "error",
                    "message": "Cart not found"
                });
            }

            console.log(cartId, cart.id);

            if (cartId !== cart.id) {
                res.status(400).json({
                    "status": "error",
                    "message": "Cart not found"
                });
            }

            const transactionRepo = new TransactionRepository();
            const createNewTransaction = new createTransaction(transactionRepo);

            // generate 10 digit random number dan string uppercase
            const orderID = Math.random().toString(36).substring(2, 12).toUpperCase();
            const result = await createQrisInvoice( orderID, req.body.total_amount);
            const expireTime = result.expiry_in_minutes;
            const paymentUrl = result.qr_url;
            
            const transaction = await createNewTransaction.execute({
                status: 'pending',
                userId: user.id,
                orderID: orderID,
                payment_method: 'qr',
                payment_url: paymentUrl,
                voucher_id: req.body.voucher_id,
                amount: req.body.total_amount,
                address: req.body.address,
                total_amount: req.body.total_amount
            });
            
            
            const transactionItemRepo = new TransactionItemRepository();
            const createNewTransactionItems = new createTransactionItems(transactionItemRepo);
            

            const items = req.body.items.map(item => {
                return {
                    transaction_id: transaction.id,
                    items_id: item.items_id,
                    qty: item.qty,
                    amount: item.amount
                }
            });

            await createNewTransactionItems.execute(items);

            // decrement stock
            const ItemRepo = new itemRepository();
            req.body.items.forEach(async item => {
                await ItemRepo.decrementStock(item.items_id, item.qty);
                await ItemRepo.incrementPoint(item.items_id, item.qty);
                await ItemRepo.incrementCountSold(item.items_id, item.qty);

                // delete cart item
                await cartItemRepo.deleteCartItemByItemId(item.items_id);
            });

            res.status(201).json({
                "status": "success",
                "message": "Transaction created",
                "data": {
                    "transaction_id": transaction.id,
                    "qr_url": paymentUrl,
                    "amount": req.body.total_amount,
                    "expiry_in_minutes": expireTime,
                }
            });

         
        } catch (err) {
            console.log(err);
            res.status(400).json({ 
                "status": "error",
                "message": "Failed to create transaction",
                'error': err.message
             });
        }
    },
    async checkPaymentStatus(req, res) {
        try {
            const transactionID = req.params.id;
            const transactionRepo = new TransactionRepository();

            const transaction = await transactionRepo.findById(transactionID);
            if (!transaction) {
                res.status(404).json({
                    "status": "error",
                    "message": "Transaction not found"
                });
            }

            const orderId = transaction.orderID;

            const result = await checkPaymentStatus(orderId);
            if (result.transaction_status === 'settlement') {
                await transactionRepo.update(transactionID, {
                    status: 'paid'
                });
            }

            res.status(200).json({
                "status": "success",
                "message": "Payment status checked",
                "data": {
                    "payment_status": result.transaction_status,
                }
            });
        } catch (err) {
            res.status(400).json({ 
                "status": "error",
                "message": "Failed to check payment status",
                'error': err.message
             });
        }
    },
    async getTransaction(req, res) {
        try {
            const user = req.user;
            const transactionRepo = new TransactionRepository();
            const transactions = await transactionRepo.findByUserId(user.id);
            if (!transactions) {
                res.status(404).json({
                    "status": "error",
                    "message": "Transaction not found"
                });
            }

            const mappedTransactions = transactions.map((transaction) => {
                return {
                    transactionId: transaction.id,
                    status: transaction.status,
                    orderID: transaction.orderID,
                    payment: {
                        method: transaction.payment_method,
                        url: transaction.payment_url,
                    },
                    amountDetails: {
                        total: transaction.total_amount,
                        address: transaction.address,
                    },
                    items: transaction.transactionItems.map((transactionItem) => {
                        return {
                            id: transactionItem.cartItem.item_id,
                            quantity: transactionItem.qty,
                            amount: transactionItem.amount,
                            name: transactionItem.cartItem.item.name,
                            images: transactionItem.cartItem.item.images.map((image) => image.url),
                        };
                    }),
                };
            });
            

            res.status(200).json({
                "status": "success",
                "data": mappedTransactions
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({ 
                "status": "error",
                "message": "Failed to get transaction",
                'error': err.message
             });
        }
    }
};
