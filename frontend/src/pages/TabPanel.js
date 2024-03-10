import React, { useState } from 'react';
import Tab from './Tab';

const TabPanel = ({ children, onTabChange }) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const handleTabChange = (index) => {
    setSelectedTabIndex(index);
    onTabChange(index);
  };

  const renderTabs = () => {
    return children.map((child, index) => (
      <Tab
        key={index}
        index={index}
        isSelected={selectedTabIndex === index}
        onClick={handleTabChange}
      >
        {child.props.title}
      </Tab>
    ));
  };

  const renderTabContent = () => {
    return children[selectedTabIndex];
  };

  return (
    <div className="tab-panel">
      <div className="tab-panel__header">{renderTabs()}</div>
      <div className="tab-panel__content">{renderTabContent()}</div>
    </div>
  );
};

export default TabPanel;
