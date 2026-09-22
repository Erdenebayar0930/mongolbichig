import AdminHeading from "@/components/site/admin/AdminHeading";
import NewsForm from "@/components/site/admin/NewsForm";

export const metadata = { title: "Шинэ мэдээ" };

export default function NewNewsPage() {
  return (
    <>
      <AdminHeading title="Шинэ мэдээ" />
      <NewsForm />
    </>
  );
}
