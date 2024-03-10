const express = require('express');
const router = express.Router();
const {
  getAllMaterialRequests,
  getMaterialRequestById,
  createMaterialRequest,
  updateMaterialRequest,
  updateMaterialRequestTableData,
  deleteMaterialRequest,
} = require('../controllers/materialRequestOpsController');


router.get('/material-requests', getAllMaterialRequests);
router.get('/material-requests/:id', getMaterialRequestById);
router.post('/material-requests', createMaterialRequest);
router.patch('/material-requests/:id/tableData/:mrfName',  updateMaterialRequestTableData);
router.put('/material-requests/:id', updateMaterialRequest);
router.delete('/material-requests/:id', deleteMaterialRequest);

module.exports = router;
