import React from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface FormInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  autoFocus?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FormInput: React.FC<FormInputProps> = ({
  type = 'text',
  placeholder,
  register,
  error,
  autoFocus = false,
  className = '',
  size = 'lg'
}) => {
  const sizeClass = size === 'lg' ? 'form-control-lg' : size === 'sm' ? 'form-control-sm' : '';
  
  return (
    <div className="mb-3">
      <input
        type={type}
        {...register}
        placeholder={placeholder}
        className={`form-control ${sizeClass} rounded-3 ${error ? 'is-invalid' : ''} ${className}`}
        autoFocus={autoFocus}
      />
      {error && <div className="invalid-feedback d-block">{error.message}</div>}
    </div>
  );
};

export default FormInput; 