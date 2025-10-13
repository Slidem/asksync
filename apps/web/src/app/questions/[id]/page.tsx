import { QuestionPage } from "@/questions/QuestionPage";
import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = use(params);
  return <QuestionPage questionId={id as unknown as string} />;
}
