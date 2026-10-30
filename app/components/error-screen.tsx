import SealMark from "./brand/seal-mark";

interface ErrorScreenProps {
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}

export default function ErrorScreen({
  title,
  body,
  action,
  onAction,
}: ErrorScreenProps) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <section
        role="alert"
        className="flex max-w-sm flex-col items-center text-center"
      >
        <SealMark size={32} text="茶" />
        <h1 className="mt-6 font-kai text-2xl text-text">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-text-2">{body}</p>
        <button type="button" onClick={onAction} className="btn btn-quiet mt-6">
          {action}
        </button>
      </section>
    </main>
  );
}
