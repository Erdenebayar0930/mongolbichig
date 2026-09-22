"use client";

/**
 * Устгах товч. `confirm()`-ыг form-ын `onSubmit`-д тавьсан: JS ажиллахгүй
 * байсан ч маягт нь ажиллана, харин ажиллаж байвал санамсаргүй даралтыг
 * барина.
 */
export default function DeleteButton({
  id,
  action,
  label = "Устгах",
  message = "Устгах уу? Буцаах боломжгүй.",
}: {
  id: string;
  action: (formData: FormData) => void;
  label?: string;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-900/45 transition-colors duration-300 hover:text-rose-700 dark:text-ivory-100/45 dark:hover:text-rose-400"
      >
        {label}
      </button>
    </form>
  );
}
