import React, { useState } from 'react';

const AdminPanel = () => {
  const [pricingDetails, setPricingDetails] = useState({
    product: 'Product A',
    price: 100,
    quantity: 5
  });

  const handleConfirm = () => {
    // Perform the confirmation action
    console.log('Pricing confirmed');
  };

  const handleNeglect = () => {
    // Perform the neglect action
    console.log('Pricing neglected');
  };

  return (
    <div>
      <h1>Admin Panel</h1>

      <div id="pricing-details">
        <h2>Pricing Details</h2>
        <p>Product: {pricingDetails.product}</p>
        <p>Price: ${pricingDetails.price}</p>
        <p>Quantity: {pricingDetails.quantity}</p>
      </div>

      <div id="confirmation-buttons">
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={handleNeglect}>Neglect</button>
      </div>
    </div>
  );
};

export default AdminPanel;
