type LoadingStateProps = {
  label?: string;
  fullScreen?: boolean;
};

export default function LoadingState({ label = 'Loading', fullScreen = true }: LoadingStateProps) {
  return (
    <div className={`${fullScreen ? 'min-h-screen' : 'min-h-48'} flex items-center justify-center bg-background px-6`} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-14 w-14" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border border-gold/30" />
          <span className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-plum border-r-gold" />
          <span className="absolute inset-4 rounded-full bg-plum-dark shadow-inner" />
        </div>
        <div>
          <p className="font-serif text-lg text-plum-dark">{label}</p>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">SK Hand Embroidery</span>
        </div>
      </div>
    </div>
  );
}
