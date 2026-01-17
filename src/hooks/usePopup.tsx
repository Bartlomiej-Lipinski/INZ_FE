'use client';

import {useCallback, useState} from 'react';
import {PopupType} from '@/components/common/Popup';

interface PopupState {
    isOpen: boolean;
    type: PopupType;
    title?: string;
    message: string;
}

export function usePopup() {
    const [popup, setPopup] = useState<PopupState>({
        isOpen: false,
        type: 'error',
        message: '',
    });

    const showPopup = useCallback((
        message: string,
        type: PopupType = 'error',
        title?: string
    ) => {
        setPopup({
            isOpen: true,
            type,
            message,
            title,
        });
    }, []);

    const hidePopup = useCallback(() => {
        setPopup((prev) => ({...prev, isOpen: false}));
    }, []);

    const showError = useCallback((message: string, title?: string) => {
        showPopup(message, 'error', title);
    }, [showPopup]);

    const showSuccess = useCallback((message: string, title?: string) => {
        showPopup(message, 'success', title);
    }, [showPopup]);

    const showWarning = useCallback((message: string, title?: string) => {
        showPopup(message, 'warning', title);
    }, [showPopup]);

    const showInfo = useCallback((message: string, title?: string) => {
        showPopup(message, 'info', title);
    }, [showPopup]);

    return {
        popup,
        showPopup,
        hidePopup,
        showError,
        showSuccess,
        showWarning,
        showInfo,
    };
}