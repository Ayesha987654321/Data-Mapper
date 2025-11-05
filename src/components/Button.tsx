import React from 'react';
import type { ButtonProps } from '../utils/interfaces';
import { BUTTON_VARIANT_CLASSES, BUTTON_SIZE_CLASSES } from '../utils/constants';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  type = 'button',
  href,
  ...rest
}) => {
  // Base button classes
  const baseClasses = 'btn';
  
  // Button class configurations
  const BUTTON_CLASS_CONFIG = [
    { condition: true, class: baseClasses },
    { condition: true, class: BUTTON_VARIANT_CLASSES[variant] },
    { condition: true, class: BUTTON_SIZE_CLASSES[size] },
    { condition: fullWidth, class: 'w-100' },
    { condition: !!className, class: className }
  ];

  // Combine all classes using map and filter
  const buttonClasses = BUTTON_CLASS_CONFIG
    .filter(config => config.condition)
    .map(config => config.class)
    .filter(Boolean)
    .join(' ');

  // Handle loading state
  const isDisabled = disabled || loading;

  // Render icon and content using functional approach
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {children}
        </>
      );
    }

    if (icon) {
      const iconElement = <span className={iconPosition === 'left' ? 'me-2' : 'ms-2'}>{icon}</span>;
      const contentElements = iconPosition === 'left' ? [iconElement, children] : [children, iconElement];
      
      return contentElements.map((element, index) => (
        <React.Fragment key={index}>{element}</React.Fragment>
      ));
    }

    return children;
  };

  // If href is provided, render as anchor
  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        {...rest}
      >
        {renderContent()}
      </a>
    );
  }

  // Default to button element
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      {...rest}
    >
      {renderContent()}
    </button>
  );
};

export default Button; 