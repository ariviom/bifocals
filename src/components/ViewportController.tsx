import React, { useState } from 'react';

interface ViewportControllerProps {
  onWidthChange: (width: number) => void;
  disabled?: boolean;
}

const PRESET_SIZES = {
  mobile: 375,
  tablet: 768,
  desktop: 1440,
};

export const ViewportController: React.FC<ViewportControllerProps> = ({ 
  onWidthChange,
  disabled = false
}) => {
  const [customWidth, setCustomWidth] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePresetClick = (name: string, width: number) => {
    if (disabled) return;
    setActivePreset(name);
    setCustomWidth(width.toString());
    onWidthChange(width);
  };

  const handleCustomWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const width = e.target.value;
    setCustomWidth(width);
    setActivePreset(null);
    const numWidth = parseInt(width, 10);
    if (!isNaN(numWidth)) {
      onWidthChange(numWidth);
    }
  };

  return (
    <div className="controls">
      {Object.entries(PRESET_SIZES).map(([name, width]) => (
        <button
          key={name}
          onClick={() => handlePresetClick(name, width)}
          className={activePreset === name ? 'active' : ''}
          disabled={disabled}
        >
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </button>
      ))}
      <input
        type="number"
        value={customWidth}
        onChange={handleCustomWidthChange}
        placeholder="Custom width"
        disabled={disabled}
      />
      <span>px</span>
    </div>
  );
}; 