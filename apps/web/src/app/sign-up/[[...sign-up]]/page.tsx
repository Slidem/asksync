import { SignUp } from "@clerk/nextjs";
import { JSX } from "react";

export async function generateStaticParams() {
  return [
    { "sign-up": [] },
    { "sign-up": ["verify-email-address"] },
    { "sign-up": ["continue"] },
    { "sign-up": ["sso-callback"] },
  ];
}

export default function SignUpPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp />
    </div>
  );
}
