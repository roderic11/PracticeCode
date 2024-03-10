const express = require('express');
const router = express.Router();
const {
  getDeliveries,
  createDelivery,
  updateDeliveryStatus,
  deleteDelivery,
  updateDeliveryRemark,
  getDeliveryById,
  updateDeliveryView,
  updateTransactionTableById,
} = require('../controllers/deliveryController');

router.get('/:id', getDeliveryById);
router.get('/', getDeliveries);
router.post('/', createDelivery);
router.put('/:id/status', updateDeliveryStatus);
router.put('/remark/:id', updateDeliveryRemark);
router.delete('/:id', deleteDelivery);
router.put('/view/:id', updateDeliveryView)
router.put('/:id/transactions/:transactionId', updateTransactionTableById);

module.exports = router;
