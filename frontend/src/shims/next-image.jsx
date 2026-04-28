import React from "react";

export default function Image({
  src,
  alt = "",
  fill,
  sizes,
  priority,
  quality,
  placeholder,
  blurDataURL,
  ...props
}) {
  const style = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...props.style,
      }
    : props.style;

  // eslint-disable-next-line jsx-a11y/alt-text
  return <img src={src} alt={alt} {...props} style={style} />;
}

