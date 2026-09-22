"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { enroll } from "@/lib/site/actions/shop";
import { EMPTY_FORM_STATE } from "@/lib/site/actions/form-state";
import { KheeDivider } from "@/components/site/ornament/Khee";

function SubmitButton() {
  // useFormStatus нь ЗААВАЛ <form>-ын дотор байх ёстой тул тусдаа бүрэлдэхүүн.
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-solid w-full">
      {pending ? "Илгээж байна…" : "Бүртгүүлэх хүсэлт илгээх"}
    </button>
  );
}

export default function EnrollForm({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const [state, formAction] = useActionState(enroll, EMPTY_FORM_STATE);

  if (state.ok) {
    return (
      <div className="surface p-8 text-center">
        <KheeDivider />
        <h3 className="mt-5 font-serif text-xl text-brand-950 dark:text-ivory-50">
          Хүсэлт хүлээн авлаа
        </h3>
        <p className="mt-3 text-[0.88rem] leading-7 text-brand-900/72 dark:text-ivory-100/66">
          «{courseTitle}» сургалтын бүртгэлийн хүсэлт бидэнд ирлээ. Ажлын нэг
          өдрийн дотор утсаар холбогдож, хуваарь болон төлбөрийн мэдээллийг
          баталгаажуулна.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface p-6 sm:p-8" noValidate>
      <h3 className="font-serif text-xl text-brand-950 dark:text-ivory-50">
        Бүртгүүлэх
      </h3>
      <p className="mt-2 text-[0.85rem] leading-6 text-brand-900/68 dark:text-ivory-100/62">
        Мэдээллээ үлдээгээрэй — бид өөрсдөө холбогдоно.
      </p>

      <input type="hidden" name="courseId" value={courseId} />

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="enroll-name" className="field-label">
            Нэр <span className="text-seal-600">*</span>
          </label>
          <input
            id="enroll-name"
            name="name"
            required
            autoComplete="name"
            className="field"
            placeholder="Овог нэр"
          />
          {state.fields?.name ? (
            <span className="field-error">{state.fields.name}</span>
          ) : null}
        </div>

        <div>
          <label htmlFor="enroll-phone" className="field-label">
            Утас <span className="text-seal-600">*</span>
          </label>
          <input
            id="enroll-phone"
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            className="field"
            placeholder="99112233"
          />
          {state.fields?.phone ? (
            <span className="field-error">{state.fields.phone}</span>
          ) : null}
        </div>

        <div>
          <label htmlFor="enroll-email" className="field-label">
            И-мэйл
          </label>
          <input
            id="enroll-email"
            name="email"
            type="email"
            autoComplete="email"
            className="field"
            placeholder="Заавал биш"
          />
          {state.fields?.email ? (
            <span className="field-error">{state.fields.email}</span>
          ) : null}
        </div>

        <div>
          <label htmlFor="enroll-note" className="field-label">
            Нэмэлт тайлбар
          </label>
          <textarea
            id="enroll-note"
            name="note"
            rows={3}
            className="field resize-y"
            placeholder="Тохиромжтой цаг, өмнөх туршлага…"
          />
        </div>
      </div>

      {state.error ? (
        <p className="mt-5 border border-seal-500/40 px-4 py-3 text-[0.85rem] text-seal-600 dark:text-seal-400">
          {state.error}
        </p>
      ) : null}

      <div className="mt-7">
        <SubmitButton />
      </div>
    </form>
  );
}
