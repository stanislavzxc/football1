import React from 'react';
import { Link } from 'react-router-dom';

interface TelegramButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary' | 'admin' | 'register';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function TelegramButton({ 
  children, 
  onClick, 
  to, 
  variant = 'primary', 
  disabled = false,
  className = '',
  style = {}
}: TelegramButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '320px',
    height: variant === 'secondary' ? '52px' : '48px', // Увеличиваем высоту для secondary кнопок
    borderRadius: variant === 'secondary' ? '26px' : '24px',
    border: '2px solid',
    textDecoration: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    touchAction: 'auto',
    padding: variant === 'secondary' ? '0 20px' : '0 16px', // Добавляем больше отступов для secondary
    ...style
  };

  const variants = {
    primary: {
      background: 'rgba(255,255,255,0.18)',
      borderColor: 'rgba(255,255,255,0.8)',
      color: 'white'
    },
    secondary: {
      background: 'rgba(255,255,255,0.24)',
      borderColor: 'rgba(255,255,255,0.6)',
      color: 'white'
    },
    admin: {
      background: 'rgba(255,165,0,0.1)',
      borderColor: 'rgba(255,165,0,0.8)',
      color: '#FFA500'
    },
    register: {
      background: '#20B136',
      borderColor: '#20B136',
      color: 'white'
    }
  };

  const buttonStyle = {
    ...baseStyle,
    ...variants[variant],
    opacity: disabled ? 0.5 : 1,
    // Добавляем стили для десктопных hover эффектов
    ...(typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !disabled ? {
      ':hover': {
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-2px)'
      }
    } : {})
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  if (to && !disabled) {
    return (
      <Link 
        to={to} 
        style={buttonStyle}
        className={className}
        onClick={handleClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      style={buttonStyle}
      className={`telegram-button telegram-button-${variant} ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}