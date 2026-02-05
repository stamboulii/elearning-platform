import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertCircle } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // 'primary', 'danger'
    isLoading = false
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            closeOnOutsideClick={!isLoading}
        >
            <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
                    }`}>
                    <AlertCircle className="w-8 h-8" />
                </div>

                <p className="text-slate-600 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button
                        variant="ghost"
                        className="flex-1 order-2 sm:order-1"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={type}
                        className="flex-1 order-1 sm:order-2"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
