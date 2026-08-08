import * as React from "react";

interface NextImageProps {
  alt?: string;
  src: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const NextImage: React.FC<NextImageProps> = ({ alt, src, width, height, className }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img alt={alt} src={src} width={width} height={height} className={className} />
);

export default NextImage;
