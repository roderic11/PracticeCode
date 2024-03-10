import axios from 'axios';

const API_URL = '/api/products/'

//Create new inventories
const createInventory = async (inventoryData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  
    const response = await axios.post(API_URL, inventoryData, config)
  
    return response.data
  }
// Get user inventories
const getInventory = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL, config)

  return response.data
}
// Delete user inventories
const deleteInventory = async (inventoryId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.delete(API_URL + inventoryId, config)

  return response.data
}

const inventoryService = {
    createInventory,
    getInventory,
    deleteInventory,
}

export default inventoryService