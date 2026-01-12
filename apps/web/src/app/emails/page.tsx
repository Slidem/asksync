"use client";

import { JSX } from "react";
import { EmailsPage } from "@/emails/components/EmailsPage";

export default function Page(): JSX.Element {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <EmailsPage />
    </div>
  );
}
