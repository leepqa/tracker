import type { ButtonHTMLAttributes } from "react";

/** Кнопка с тем же видом, что и `button` в app.html (стили — в global.css). */
export function Button({ type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} {...rest} />;
}
