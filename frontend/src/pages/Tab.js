import React from 'react';

const Tab = ({ index, isSelected, onClick, children }) => {
  const handleClick = () => {
    onClick(index);
  };

  return (
    <div
      className={`tab ${isSelected ? 'tab--selected' : ''}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

export default Tab;
