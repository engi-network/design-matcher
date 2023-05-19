import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = {
  className?: string;
  variant?: string;
  size?: string;
};

export default function Button({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  let paddingX;
  let paddingY;
  let textSize;
  switch (size) {
    case "small":
      paddingX = "px-4";
      paddingY = "py-2";
      textSize = "text-sm";
      break;
    case "large":
      paddingX = "px-10";
      paddingY = "py-6";
      textSize = "text-lg";
      break;
    default:
      paddingX = "px-7";
      paddingY = "py-3";
      textSize = "text-sm";
  }

  const sizeClasses = classNames({
    [paddingX]: !/px-/.test(className ?? ""),
    [paddingY]: !/py-/.test(className ?? ""),
    [textSize]: !/text-(xs|sm|base|lg|.?xl)/.test(className ?? ""),
  });

  let variantClasses: string;
  if (variant === "primary") {
    variantClasses = "bg-white font-bold text-black border border-white";
  } else {
    variantClasses = classNames("bg-black/20 font-bold text-white border border-white");
  }

  return (
    <button
      className={classNames("", sizeClasses, variantClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}
