import AdminHeading from "@/components/site/admin/AdminHeading";
import { saveSettings } from "@/lib/site/actions/admin";
import { getSettings } from "@/lib/site/queries";
import {
  SETTING_KEYS,
  SETTING_LABELS,
  SETTING_MULTILINE,
} from "@/lib/site/settings";

export const metadata = { title: "Тохиргоо" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <AdminHeading title="Сайтын тохиргоо" />

      <p className="mb-8 max-w-2xl text-[0.88rem] leading-7 text-brand-900/68 dark:text-ivory-100/62">
        Эдгээр утга нь хөл хэсэг, «Бидний тухай», захиалгын хуудсанд шууд
        харагдана. Хоосон орхивол өмнө нь кодод бичсэн үндсэн утга ажиллана.
      </p>

      <form action={saveSettings} className="space-y-8">
        <div className="surface grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          {SETTING_KEYS.map((key) => {
            const multiline = SETTING_MULTILINE.includes(key);

            return (
              <div key={key} className={multiline ? "sm:col-span-2" : undefined}>
                <label htmlFor={key} className="field-label">
                  {SETTING_LABELS[key]}
                </label>
                {multiline ? (
                  <textarea
                    id={key}
                    name={key}
                    rows={3}
                    defaultValue={settings[key]}
                    className="field resize-y"
                  />
                ) : (
                  <input
                    id={key}
                    name={key}
                    defaultValue={settings[key]}
                    className="field"
                  />
                )}
              </div>
            );
          })}
        </div>

        <button type="submit" className="btn-solid">
          Хадгалах
        </button>
      </form>
    </>
  );
}
