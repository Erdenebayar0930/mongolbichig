"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login } from "@/lib/site/actions/admin";
import { EMPTY_FORM_STATE } from "@/lib/site/actions/form-state";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-solid mt-6 w-full">
      {pending ? "Шалгаж байна…" : "Нэвтрэх"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(login, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="surface mt-10 p-7">
      <label htmlFor="password" className="field-label">
        Нууц үг
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        className="field"
      />

      {state.error ? (
        <p className="mt-5 border border-seal-500/40 px-4 py-3 text-[0.85rem] text-seal-600 dark:text-seal-400">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
