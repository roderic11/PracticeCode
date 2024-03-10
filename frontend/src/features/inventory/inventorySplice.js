import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from './inventoryService'

// Get product from localStorage
const product = JSON.parse(localStorage.getItem('product'))

const initialState = {
  product: product ? product : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// CreateProduct product
export const createProduct = createAsyncThunk(
  'product/register',
  async (product, thunkAPI) => {
    try {
      return await productService.createProduct(product)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)


export const authSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.product = action.payload
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
        state.product = null
      })
  },
})

export const { reset } = authSlice.actions
export default authSlice.reducer
