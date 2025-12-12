import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const [logoError, setLogoError] = useState(false);
  
  const sizes = {
    sm: { icon: 'h-8 w-8', text: 'text-lg', iconSize: 'h-4 w-4' },
    md: { icon: 'h-10 w-10', text: 'text-xl', iconSize: 'h-6 w-6' },
    lg: { icon: 'h-16 w-16', text: 'text-2xl', iconSize: 'h-8 w-8' },
  };

  const sizeClasses = sizes[size] || sizes.md;

  const handleImageError = (e) => {
    // Try SVG if PNG fails
    if (e.target.src.endsWith('.png')) {
      e.target.onerror = null;
      e.target.src = '/logo.svg';
    } else {
      // If both fail, show fallback icon
      setLogoError(true);
    }
  };

  return (
    <Link 
      to="/" 
      className={`flex items-center group transition-all duration-300 hover:scale-105 ${className}`}
    >
      <div className={`${sizeClasses.icon} bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center ${showText ? 'mr-3' : ''} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
        {!logoError ? (
          <img 
            src="/logo.png" 
            alt="InclusionNet Logo" 
            className="w-full h-full object-contain p-1.5"
            onError={handleImageError}
          />
        ) : (
          <TrendingUp className={`${sizeClasses.iconSize} text-white`} />
        )}
      </div>
      {showText && (
        <span className={`${sizeClasses.text} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          InclusionNet
        </span>
      )}
    </Link>
  );
};

export default Logo;

