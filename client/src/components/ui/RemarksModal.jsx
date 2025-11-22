import React, { useState } from 'react';
import { X, AlertCircle, Ban, XCircle, CheckCircle, Info } from 'lucide-react';

const RemarksModal = ({
    isOpen,
    onClose,
    onSubmit,
    title = "Add Remarks",
    description = "Please provide your remarks below",
    actionType = "default", // default, ban, reject, approve, warning
    placeholder = "Enter your remarks here...",
    submitText = "Submit",
    maxLength = 500
}) => {
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!remarks.trim()) return;

        setIsSubmitting(true);
        await onSubmit(remarks);
        setIsSubmitting(false);
        setRemarks('');
    };

    const handleClose = () => {
        setRemarks('');
        onClose();
    };

    if (!isOpen) return null;

    const actionStyles = {
        default: { bg: 'bg-blue-500', icon: Info, color: 'text-blue-500' },
        ban: { bg: 'bg-red-500', icon: Ban, color: 'text-red-500' },
        reject: { bg: 'bg-red-500', icon: XCircle, color: 'text-red-500' },
        approve: { bg: 'bg-green-500', icon: CheckCircle, color: 'text-green-500' },
        warning: { bg: 'bg-yellow-500', icon: AlertCircle, color: 'text-yellow-500' }
    };

    const currentStyle = actionStyles[actionType] || actionStyles.default;
    const Icon = currentStyle.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="flex items-start gap-4">
                        <div className={`${currentStyle.bg} p-3 rounded-xl shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                            <p className="text-sm text-gray-600 mt-1">{description}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 pb-6">
                    <div className="relative">
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value.slice(0, maxLength))}
                            placeholder={placeholder}
                            className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-gray-900 placeholder-gray-400"
                            autoFocus
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className={`text-xs ${remarks.length >= maxLength ? 'text-red-500' : 'text-gray-500'}`}>
                                {remarks.length}/{maxLength} characters
                            </span>
                            {remarks.trim() && (
                                <span className={`text-xs font-medium ${currentStyle.color}`}>
                                    ✓ Ready to submit
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!remarks.trim() || isSubmitting}
                            className={`flex-1 px-4 py-2.5 ${currentStyle.bg} hover:opacity-90 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-${actionType === 'default' ? 'blue' : actionType === 'ban' || actionType === 'reject' ? 'red' : actionType === 'approve' ? 'green' : 'yellow'}-500/30`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : submitText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemarksModal;