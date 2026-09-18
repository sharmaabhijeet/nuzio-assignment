export default function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'on' : ''}`}
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
    >
      <span />
    </button>
  );
}
