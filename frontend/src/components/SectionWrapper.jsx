export default function SectionWrapper({ className = "", id, children }) {
  return (
    <section id={id} className={className}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

