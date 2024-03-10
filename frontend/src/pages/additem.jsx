import React, { useState } from 'react';

function AddItemForm({ addItem }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = { id: Date.now(), name };
    addItem(newItem);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Add Item</button>
    </form>
  );
}

export default AddItemForm;
