import AdminHeading from "@/components/site/admin/AdminHeading";
import CourseForm from "@/components/site/admin/CourseForm";

export const metadata = { title: "Шинэ сургалт" };

export default function NewCoursePage() {
  return (
    <>
      <AdminHeading title="Шинэ сургалт" />
      <CourseForm />
    </>
  );
}
