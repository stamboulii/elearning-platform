import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    icon: Icon,
    type = 'button',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';

    const variants = {
        primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200',
        secondary: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50',
        danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-50',
        outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base'
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : Icon ? (
                <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
            ) : null}
            {children}
        </button>
    );
};

export default Button;
