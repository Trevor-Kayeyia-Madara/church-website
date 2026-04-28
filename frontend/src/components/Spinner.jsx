export default function Spinner({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-block size-5 rounded-full border-2 border-white/20 border-t-accent animate-spin",
        className,
      ].join(" ")}
    />
  );
}

