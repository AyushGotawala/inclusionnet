import React, { useEffect, useRef } from 'react';

const AnimatedPage = ({ children, className = '' }) => {
  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.classList.add('page-enter');
    }
  }, []);

  return (
    <div ref={pageRef} className={`min-h-screen ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedPage;

