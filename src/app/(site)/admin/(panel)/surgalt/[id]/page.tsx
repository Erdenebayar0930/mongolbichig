import { notFound } from "next/navigation";

import AdminHeading from "@/components/site/admin/AdminHeading";
import CourseForm from "@/components/site/admin/CourseForm";
import { adminGetCourse } from "@/lib/site/queries";

export const metadata = { title: "Сургалт засах" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await adminGetCourse(id);

  if (!course) notFound();

  return (
    <>
      <AdminHeading title="Сургалт засах" />
      <CourseForm course={course} />
    </>
  );
}
