export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) {
  return (
    <button type={type} className={`primary ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
