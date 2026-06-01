import React from 'react';
import './Input.css';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, required }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={name} className="input-label">{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
};

export default Input;
