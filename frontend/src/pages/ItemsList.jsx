import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./inventory.css";
import Modal from "react-modal";

function Cute() {
  const [itemName, setItemName] = useState("");
  const [supplierInputs, setSupplierInputs] = useState([
    { supplier: "", unitCost: "" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [items, setItems] = useState([{ ItemName: "", unitCost: "" }]);
  const [category, setCategory] = useState("");

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedItems = [...items];
    updatedItems[index][name] = value;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { ItemName: "", unitCost: "" }]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCategory) {
      // Add items to the selected existing supplier
      const existingCategory = tableData.find(
        (data) => data.category === selectedCategory
      );

      if (existingCategory) {
        const updatedCategory = {
          ...existingCategory,
          items: [...existingCategory.items, ...items],
        };

        try {
          const response = await axios.put(
            `/api/supplies/${existingCategory._id}`,
            updatedCategory
          );
          console.log("Item added to existing supplier:", response.data);
          resetFormFields();
          setError(null);
          fetchTableData();
        } catch (error) {
          console.log("Error adding item to existing supplier:", error);
        }
      }
    } else {
      // Create a new supplier entry
      const newData = {
        itemCategory: category, // Include the category field
        items: items.map((item) => ({
          ItemName: item.ItemName,
          unit:item.unit,
          unitCost: item.unitCost,
        })),
      };

      try {
        const response = await axios.post("/api/supplies", newData);
        console.log("New supplier created successfully:", response.data);
        resetFormFields();
        setError(null);
        fetchTableData();
      } catch (error) {
        console.log("Error creating new supplier:", error);
      }
    }
  };

  const resetFormFields = () => {
    setSelectedCategory("");
    setSupplier("");
    setCategory("");
    setItems([{ ItemName: "", unitCost: "" ,unit:" "}]);
  };

  const fetchTableData = () => {
    axios
      .get("/api/supplies")
      .then((response) => {
        setTableData(response.data);
      })
      .catch((error) => {
        console.log(error);
        setError(
          "An error occurred while fetching the table data: " + error.message
        );
      });
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="body1">
      <h1>Item List Summary</h1>
      {error && <div>{error}</div>}
      <div>
        <button onClick={openModal}>Add Items</button>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Create BOM Modal"
        >
          <form onSubmit={handleSubmit}>
            <div className="body1">
              <h1>Item Database</h1>

              <label htmlFor="supplier">Select or Add New Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">-- Select Category --</option>
                {tableData.map((data) => (
                  <option key={data._id} value={data.category}>
                    {data.category}
                  </option>
                ))}
              </select>

              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="New Item Category"
                disabled={!!selectedCategory}
              />
            </div>
            <div>
              {items.map((item, index) => (
                <div key={index}>
                  <label htmlFor={`ItemName-${index}`}>Item Name:</label>
                  <input
                    type="text"
                    id={`ItemName-${index}`}
                    name="ItemName"
                    value={item.ItemName}
                    onChange={(e) => handleInputChange(index, e)}
                  />

                  <label htmlFor={`unitCost-${index}`}>Unit Cost:</label>
                  <input
                    type="text"
                    id={`unitCost-${index}`}
                    name="unitCost"
                    value={item.unitCost}
                    onChange={(e) => handleInputChange(index, e)}
                  />
                    <label htmlFor={`unit-${index}`}>Unit:</label>
                  <input
                    type="text"
                    id={`unit-${index}`}
                    name="unit"
                    value={item.unit}
                    onChange={(e) => handleInputChange(index, e)}
                  />
                  <button type="button" onClick={() => handleRemoveItem(index)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddItem}>
                Add Item
              </button>
            </div>
            <button type="submit">Create Supply</button>
          </form>
        </Modal>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Items</th>
              <th>Unit Cost</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr key={index}>
                <td> {item.itemCategory}</td>
                <td>
                  {item.items.map((subItem, subIndex) => (
                    <div key={subIndex}>
                      <span>{subItem.ItemName}</span>
                    </div>
                  ))}
                </td>
                <td>
                  {item.items.map((subItem, subIndex) => (
                    <div key={subIndex}>
                      <span>{subItem.unitCost}</span>
                    </div>
                  ))}
                </td>
                <td>
                  {item.items.map((subItem, subIndex) => (
                    <div key={subIndex}>
                      <span>{subItem.unit}</span>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Cute;
