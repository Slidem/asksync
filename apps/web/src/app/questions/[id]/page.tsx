import { QuestionPage } from "@/questions/QuestionPage";
import { JSX, use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ id: string[] }>;
}): JSX.Element {
  const { id } = use(params);
  return <QuestionPage questionId={id as unknown as string} />;
}
