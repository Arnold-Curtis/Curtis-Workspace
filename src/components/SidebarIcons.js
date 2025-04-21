import React, { useState } from 'react';
import './SidebarIcons.css';

function SidebarIcons() {
  const [activeIcon, setActiveIcon] = useState('explorer');

  const handleIconClick = (iconName) => {
    setActiveIcon(iconName);
  };

  return (
    <div className="SidebarIcons">
      <div 
        className={`icon-container ${activeIcon === 'explorer' ? 'active' : ''}`}
        onClick={() => handleIconClick('explorer')}
      >
        <img src="/Explorer.png" alt="Explorer" className="icon" title="Explorer" />
        {activeIcon === 'explorer' && <div className="active-indicator"></div>}
      </div>
      <div 
        className={`icon-container ${activeIcon === 'search' ? 'active' : ''}`}
        onClick={() => handleIconClick('search')}
      >
        <img src="/Search.png" alt="Search" className="icon" title="Search" />
        {activeIcon === 'search' && <div className="active-indicator"></div>}
      </div>
      <div 
        className={`icon-container ${activeIcon === 'sourceControl' ? 'active' : ''}`}
        onClick={() => handleIconClick('sourceControl')}
      >
        <img src="/SourceControl.png" alt="Source Control" className="icon" title="Source Control" />
        {activeIcon === 'sourceControl' && <div className="active-indicator"></div>}
      </div>
      <div 
        className={`icon-container ${activeIcon === 'debug' ? 'active' : ''}`}
        onClick={() => handleIconClick('debug')}
      >
        <img src="/Run&Debug.png" alt="Run & Debug" className="icon" title="Run & Debug" />
        {activeIcon === 'debug' && <div className="active-indicator"></div>}
      </div>
      <div 
        className={`icon-container ${activeIcon === 'extensions' ? 'active' : ''}`}
        onClick={() => handleIconClick('extensions')}
      >
        <img src="/Extensions.png" alt="Extensions" className="icon" title="Extensions" />
        {activeIcon === 'extensions' && <div className="active-indicator"></div>}
      </div>
      <div 
        className={`icon-container ${activeIcon === 'chat' ? 'active' : ''}`}
        onClick={() => handleIconClick('chat')}
      >
        <img src="/Chat.png" alt="Chat" className="icon" title="Chat" />
        {activeIcon === 'chat' && <div className="active-indicator"></div>}
      </div>
    </div>
  );
}

export default SidebarIcons;