export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M17 3.5C11.1 3.5 6.3 8.3 6.3 14.2c0 8.5 10.7 16.3 10.7 16.3s10.7-7.8 10.7-16.3C27.7 8.3 22.9 3.5 17 3.5Z" fill="currentColor"/>
      <path d="M11.4 15.2c2.2 1.9 4.1 2.9 5.6 2.9 1.7 0 3.6-1 5.7-2.9" stroke="#222420" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  );
}

export function Wordmark() {
  return <div className="flex items-center gap-2.5 text-[#222420]"><Mark className="h-7 w-7 text-[#d9f16d]" /><span className="text-[1.25rem] font-semibold tracking-[-.07em]">daymark</span></div>;
}
