import React from 'react';

const Avatar = ({
    src,
    firstName,
    lastName,
    size = 'md',
    className = '',
    border = true
}) => {
    const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : '?';

    const sizes = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-24 h-24 text-2xl',
        '2xl': 'w-32 h-32 text-4xl'
    };

    // Generate a consistent background color based on the name
    const getBackgroundColor = (name) => {
        if (!name) return 'bg-indigo-500';
        const colors = [
            'bg-indigo-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-rose-500',
            'bg-orange-500',
            'bg-amber-500',
            'bg-emerald-500',
            'bg-teal-500',
            'bg-cyan-500',
            'bg-sky-500',
            'bg-blue-500'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const bgColor = getBackgroundColor(firstName + lastName);

    if (src) {
        return (
            <img
                src={src}
                alt={`${firstName} ${lastName}`}
                className={`${sizes[size] || size} rounded-full object-cover ${border ? 'border-2 border-slate-200 dark:border-slate-800' : ''} ${className}`}
            />
        );
    }

    return (
        <div className={`${sizes[size] || size} rounded-full ${bgColor} text-white flex items-center justify-center font-bold ${border ? 'border-2 border-slate-200 dark:border-slate-800' : ''} ${className}`}>
            {firstLetter}
        </div>
    );
};

export default Avatar;
