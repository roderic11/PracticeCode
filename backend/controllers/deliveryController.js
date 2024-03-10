const asyncHandler = require('express-async-handler');
const Delivery = require('../models/deliveryModel');

// @desc      Get a specific delivery by ID
// @route     GET /api/deliveries/:id
// @access    Public
const getDeliveryById = asyncHandler(async (req, res) => {
  const deliveryId = req.params.id;

  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  res.json(delivery);
});

// @desc      Get all deliveries
// @route     GET /api/deliveries
// @access    Public
const getDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find();
  res.json(deliveries);
});

// @desc      Create a new delivery
// @route     POST /api/deliveries
// @access    Public
const createDelivery = asyncHandler(async (req, res) => {
  const { trackingNumber, title, place, tableData, remark, purchaseId} = req.body;

  const delivery = new Delivery({
    trackingNumber,
    title,
    place,
    remark,
    purchaseId,
    tableData,

  });

  const createdDelivery = await delivery.save();
  res.status(201).json(createdDelivery);
});


// @desc      Update a delivery
// @route     PUT /api/deliveries/:id
// @access    Public
const updateDeliveryRemark = asyncHandler(async (req, res) => {
  const { remark, tableData } = req.body;

  // Get the delivery by ID
  const delivery = await Delivery.findById(req.params.id);

  if (delivery) {
    // Update the delivery fields if provided in the request body
   
    delivery.remark = remark || delivery.remark;
    delivery.tableData = tableData  || delivery.tableData ;
    // Save the updated delivery
    const updatedDelivery = await delivery.save();
    res.json(updatedDelivery);
  } else {
    res.status(404);
    throw new Error("Delivery not found");
  }
});

const updateTransactionTableById = asyncHandler(async (req, res) => {
  const deliveryId = req.params.id;
  const transactionId = req.params.transactionId;
  const { transactionTable, undeliveredId } = req.body;

  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Find the transaction within the tableData array based on _id
    const transactionIndex = delivery.tableData.findIndex(
      (transaction) => transaction._id.toString() === transactionId
    );

    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update the transactionTable at the specified index
    delivery.tableData[transactionIndex].transactionTable = transactionTable;
    delivery.tableData[transactionIndex].undeliveredId = undeliveredId;
    await delivery.save();

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update transactionTable' });
  }
});


// @desc      Update a delivery
// @route     PUT /api/deliveries/:id
// @access    Public
const updateDeliveryView = asyncHandler(async (req, res) => {
  const { view, read, see } = req.body;

  // Get the delivery by ID
  const delivery = await Delivery.findById(req.params.id);

  if (delivery) {
    // Update the delivery fields if provided in the request body
   
    delivery.view = view || delivery.view;
    delivery.read = read || delivery.read;
    delivery.see = see || delivery.see;
 
    // Save the updated delivery
    const updatedDelivery = await delivery.save();
    res.json(updatedDelivery);
  } else {
    res.status(404);
    throw new Error("Delivery not found");
  }
});
// @desc      Update delivery status
// @route     PUT /api/deliveries/:id/status
// @access    Public
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const deliveryId = req.params.id;
  const { status, name, date, comment, time, location, qrCodeData, place, transactionTable, remark } = req.body;

  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Create an object to represent the new status data
    const newStatusData = {
      status,
      name,
      date,
      comment,
      time,
      location,
      qrCodeData,
      remark,
      place,
      transactionTable,
      
    };

    // Add the new status data to the beginning of the tableData array
    delivery.tableData.unshift(newStatusData);

    await delivery.save();

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
});

// @desc      Delete a delivery
// @route     DELETE /api/deliveries/:id
// @access    Public
const deleteDelivery = asyncHandler(async (req, res) => {
  const deliveryId = req.params.id;

  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found' });
  }

  await delivery.remove();

  res.json({ message: 'Delivery removed' });
});

module.exports = { getDeliveries, createDelivery, updateDeliveryStatus, deleteDelivery, getDeliveryById, updateDeliveryRemark, updateDeliveryView, updateTransactionTableById };
