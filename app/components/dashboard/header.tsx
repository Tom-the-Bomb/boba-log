import ThemeToggle from "../theme-toggle";

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export default function Header({ username, onLogout }: HeaderProps) {
  return (
    <header className="tea-page-padding tea-border-subtle flex items-center justify-between border-b py-6">
      <div>
        <h1 className="font-display tea-text-primary text-2xl font-medium tracking-tight">
          Boba Log
        </h1>
        <p className="tea-text-muted mt-0.5 text-[10px] tracking-[0.2em] uppercase">
          {username}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button type="button" onClick={onLogout} className="tea-link">
          Logout
        </button>
      </div>
    </header>
  );
}
