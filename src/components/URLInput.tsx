import React, { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface URLInputProps {
  onURLChange: (url: string) => void;
  placeholder?: string;
}

export const URLInput: React.FC<URLInputProps> = ({ onURLChange, placeholder = 'Enter URL...' }) => {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Basic URL validation
  const validateURL = (url: string): boolean => {
    if (!url) return true; // Empty is considered valid
    // Allow URLs without protocol for user convenience
    const urlToTest = url.match(/^https?:\/\//) ? url : `https://${url}`;
    try {
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  // Debounced URL change handler
  const debouncedURLChange = useCallback(
    debounce((value: string) => {
      if (validateURL(value)) {
        onURLChange(value);
      }
    }, 500), // 500ms delay
    [onURLChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const valid = validateURL(newUrl);
    setIsValid(valid);
    debouncedURLChange(newUrl);
  };

  return (
    <div className="url-input-container">
      <input
        type="text"
        value={url}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        className={!isValid ? 'invalid' : ''}
      />
      {!isValid && (
        <div className="error-message">
          Please enter a valid URL
        </div>
      )}
    </div>
  );
}; 