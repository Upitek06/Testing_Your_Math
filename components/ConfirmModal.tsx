"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmModal({
    isOpen,
    onConfirm,
    onCancel,
    title = "Konfirmasi",
    message = "Apakah Anda yakin ingin keluar?",
    confirmText = "Ya, Keluar",
    cancelText = "Batalkan",
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Tutup modal dengan ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onCancel();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onCancel]);

    // Cegah scroll di belakang modal
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onCancel} />

            {/* Modal */}
            <div className="modal-container" ref={modalRef}>
                <div className="modal-icon">⚠️</div>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </>
    );
}