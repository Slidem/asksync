import { SignIn } from "@clerk/nextjs";

export async function generateStaticParams() {
  return [
    { "sign-in": [] },
    { "sign-in": ["factor-one"] },
    { "sign-in": ["factor-two"] },
    { "sign-in": ["sso-callback"] },
    { "sign-in": ["reset-password"] },
  ];
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  );
}
