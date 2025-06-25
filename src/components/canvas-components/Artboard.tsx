import React from 'react';

type ArtboardProps = {
  children: React.ReactNode;
  width: number;
  height: number;
} & React.HTMLAttributes<HTMLDivElement>;

const Artboard = ({ children, width, height, ...props }: ArtboardProps) => {
  return (
    <div
      {...props}
      className="bg-white shadow-lg relative bg-grid-pattern"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {children}
    </div>
  );
};

export default Artboard;
