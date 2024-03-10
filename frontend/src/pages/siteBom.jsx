import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SiteBom = ({ match }) => {
  const [project, setProject] = useState(null);
  const [product, setProduct] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  useEffect(() => {
    const fetchProject = async (projectId) => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data.project);
      } catch (error) {
        console.error(error);
        setProject(null);
      }
    };
    
    fetchProject();
  }, [match.params.id]);

    
      return (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Item</h2>
            <div>
              <label htmlFor="product">Product:</label>
              <input
                type="text"
                id="product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="unit">Unit:</label>
              <input
                type="text"
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="text"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              
            </div>
          </div>
        </div>
      );
    };
    
  
export default SiteBom;
