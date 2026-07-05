'use client';

import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, LucideIcon } from 'lucide-react';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  icon?: LucideIcon;
}

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  icon: Icon,
}: ConfirmationModalProps) {
  if (!visible) return null;

  return (
    <Modal title={title} onClose={onClose} maxWidth="400px">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
        {Icon ? (
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: isDestructive ? 'var(--danger-muted)' : 'var(--brand-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={28} color={isDestructive ? 'var(--danger)' : 'var(--brand)'} />
          </div>
        ) : (
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: isDestructive ? 'var(--danger-muted)' : 'var(--brand-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isDestructive ? (
              <AlertTriangle size={28} color="var(--danger)" />
            ) : (
              <Info size={28} color="var(--brand)" />
            )}
          </div>
        )}

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
            style={{ flex: 1, padding: '12px' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={isDestructive ? 'btn-danger' : 'btn-primary'}
            disabled={isLoading}
            style={{ flex: 1, padding: '12px' }}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
