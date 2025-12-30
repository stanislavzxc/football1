import React, { useState } from 'react';
import { TelegramButton } from './TelegramButton';
import { PaymentNotificationModal } from './PaymentNotificationModal';
import { api } from '../services/api';
import { telegramWebApp } from '../utils/telegram';
import type { PaymentCreateResponse } from '../types';

interface PaymentButtonProps {
  registrationId: number;
  amount: number;
  onPaymentCreated?: () => void;
  disabled?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  registrationId,
  amount,
  onPaymentCreated,
  disabled = false
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const handleButtonClick = () => {
    if (isCreating || disabled) return;
    setShowNotificationModal(true);
  };

  const handleCreatePayment = async () => {
    setShowNotificationModal(false);
    
    if (isCreating || disabled) return;

    setIsCreating(true);
    setError('');

    try {
      // Получаем текущий URL для возврата
      const returnUrl = window.location.origin + window.location.pathname;
      
      const response: PaymentCreateResponse = await api.createPayment(
        registrationId,
        amount,
        returnUrl
      );
      
      if (response.success && response.confirmation_url) {
        // Открываем страницу оплаты ЮКассы через Telegram WebApp.openInvoice
        // Это специальный метод для открытия платежных форм в Telegram
        telegramWebApp.openInvoice(response.confirmation_url, (status: string) => {
          console.log('Invoice status:', status);
          // Можно обработать статус оплаты здесь
        });
        
        if (onPaymentCreated) {
          onPaymentCreated();
        }
      } else {
        setError('Ошибка при создании платежа');
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      setError(error.message || 'Ошибка при создании платежа');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <TelegramButton
          onClick={handleButtonClick}
          disabled={disabled || isCreating}
          style={{
            backgroundColor: disabled || isCreating ? '#666' : '#4CAF50',
            borderColor: disabled || isCreating ? '#666' : '#4CAF50',
            color: 'white',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '2px solid',
            cursor: disabled || isCreating ? 'not-allowed' : 'pointer',
            opacity: disabled || isCreating ? 0.6 : 1,
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '300px',
            fontWeight: '600'
          }}
        >
          {isCreating ? (
            '⏳ Создаем платеж...'
          ) : (
            `💳 Оплатить ${amount} ₽`
          )}
        </TelegramButton>
        
        {error && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb'
            }}
          >
            ❌ {error}
          </div>
        )}
        
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'rgba(255, 255, 255, 0.7)', 
          marginTop: '0.5rem',
          fontStyle: 'italic'
        }}>
          Откроется окно ЮКассы для оплаты
        </div>
      </div>

      <PaymentNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onProceed={handleCreatePayment}
      />
    </>
  );
};