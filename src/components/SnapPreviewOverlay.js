import React from 'react';
import { useWindowManager } from './WindowManager';
import './SnapPreviewOverlay.css';

const SnapPreviewOverlay = () => {
    const { snapZone } = useWindowManager();

    if (!snapZone) return null;

    return (
        <div className={`snap-preview-overlay snap-${snapZone}`}>
            <div className="snap-preview-inner"></div>
        </div>
    );
};

export default SnapPreviewOverlay;
