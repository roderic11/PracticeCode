import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import inventoryService from './inventoryService'

const initialState = {
  inventories: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Create new inventory
export const createInventory = createAsyncThunk(
  'product/create',
  async (inventoryData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await inventoryService.createInventory(inventoryData, token)
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

// Get user inventories
export const getInventory = createAsyncThunk(
  'product/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await inventoryService.getInventory (token)
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

// Delete user inventory
export const deleteInventory = createAsyncThunk(
  'product/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await inventoryService.deleteInventory(id, token)
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

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInventory.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createInventory.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.inventories.push(action.payload)
      })
      .addCase(createInventory.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getInventory.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getInventory.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.inventories = action.payload
      })
      .addCase(getInventory.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteInventory.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.inventories = state.inventories.filter(
          (inventory) => inventory._id !== action.payload.id
        )
      })
      .addCase(deleteInventory.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = inventorySlice.actions
export default inventorySlice.reducer
