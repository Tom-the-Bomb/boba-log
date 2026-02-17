interface ConfirmDeleteModalProps {
  shopName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  shopName,
  isDeleting,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] dark:bg-black/60"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="tea-surface tea-border-subtle relative z-10 w-full max-w-sm border px-10 py-10">
        <h3 className="font-display tea-text-primary text-2xl font-medium tracking-tight">
          Delete shop
        </h3>
        <p className="tea-text-muted mt-4 text-sm leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="tea-text-primary font-medium">{shopName}</span>? This
          will remove all its drink history.
        </p>

        <div className="flex items-center justify-end gap-5 pt-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="tea-link"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 px-6 py-3 text-xs tracking-[0.15em] uppercase text-white transition-colors hover:bg-red-700 disabled:opacity-40"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
