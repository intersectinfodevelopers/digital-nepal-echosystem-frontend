import * as React from "react";

const NextImage = ({ alt, src, width, height, className }: any) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img alt={alt} src={src} width={width} height={height} className={className} />
);

export default NextImage;
