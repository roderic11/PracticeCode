const express = require('express');

const router = express.Router();
const {
    getAllMrf,
    createNewMrf,
    updateProjectMrf,
    deleteMrf,
    getObjAddMrf ,
    getIdProjectMrf,
    updateItemQuantity,
} = require('../controllers/mrfController');

// GET /api/projects

router.get('/', getAllMrf);
//get /api/ projects by a specific ID 
router.get('/:id', getIdProjectMrf);


// POST /api/projects
router.post('/', createNewMrf);

// PATCH /api/projects/:projectId/items/:itemId/quantity
router.patch('/:projectId/items/:itemId', updateItemQuantity);

router.patch('/:id', updateProjectMrf);

// DELETE /api/projects/:id
router.delete('/:id', deleteMrf);



module.exports = router;
