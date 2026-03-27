import React from 'react';

export function SkeletonLoader() {
  return (
    <div className="skeleton-lines">
      <div className="skeleton-block" style={{ height: 12, width: '90%' }} />
      <div className="skeleton-block" style={{ height: 12, width: '70%' }} />
      <div className="skeleton-block" style={{ height: 12, width: '80%' }} />
    </div>
  );
}
