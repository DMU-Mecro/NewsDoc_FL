export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#0b1324] p-6 rounded-2xl border border-slate-800 shadow-xl ${className}`}>
      {children}
    </div>
  );
}