import React from 'react';

interface NextImageMockProps {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
  [key: string]: any;
}

export default function Image({
  src,
  alt = '',
  width,
  height,
  fill,
  className,
  style,
  ...rest
}: NextImageMockProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={fill ? { ...style, width: '100%', height: '100%', objectFit: 'cover' } : style}
      {...rest}
    />
  );
}
