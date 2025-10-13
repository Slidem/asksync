import { SignUp } from "@clerk/nextjs";

export async function generateStaticParams() {
  return [
    { "sign-up": [] },
    { "sign-up": ["verify-email-address"] },
    { "sign-up": ["continue"] },
    { "sign-up": ["sso-callback"] },
  ];
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp />
    </div>
  );
}
