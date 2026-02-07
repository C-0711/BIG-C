import React from 'react';

export function SkeletonText({ width = '100%', height = '1rem' }) {
  return (
    <div
      className="skeleton skeleton-text"
      style={{ width, height }}
    />
  );
}

export function SkeletonAvatar({ size = 80 }) {
  return (
    <div
      className="skeleton skeleton-avatar"
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
      <SkeletonText width="70%" height="1.25rem" />
      <SkeletonText width="100%" height="0.875rem" style={{ marginTop: '0.5rem' }} />
      <SkeletonText width="90%" height="0.875rem" />
      <SkeletonText width="60%" height="0.875rem" />
    </div>
  );
}

export function SkeletonEntityCard() {
  return (
    <div className="entity-card">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <SkeletonAvatar size={80} />
        <div style={{ flex: 1 }}>
          <SkeletonText width="200px" height="1.5rem" />
          <SkeletonText width="150px" height="1rem" style={{ marginTop: '0.5rem' }} />
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <SkeletonText width="100%" />
        <SkeletonText width="80%" />
      </div>
    </div>
  );
}

export function SkeletonGraph() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1rem' }} />
        <p>Loading graph visualization...</p>
      </div>
    </div>
  );
}

export function SkeletonResultsList({ count = 5 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
