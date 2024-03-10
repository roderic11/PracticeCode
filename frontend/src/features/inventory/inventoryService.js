import axios from 'axios'

const API_URL = '/api/inventory/'

// CreateProduct user
const createProduct = async (userData) => {
  const response = await axios.post(API_URL, userData)

  if (response.data) {
    localStorage.setItem('product', JSON.stringify(response.data))
  }

  return response.data
}


const productService = {
  createProduct,

}

export default productService
