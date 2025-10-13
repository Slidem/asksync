import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const publicPages = ["/sign-in", "/sign-up"];

/**
 * UnauthenticatedHandler component to handle unauthenticated users
 * and redirect them to sign-in page if they are not on a public page.
 */
const UnauthenticatedRouter: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = publicPages.some((page) => pathname.startsWith(page));

  useEffect(() => {
    if (!isPublicPage) {
      router.push("/sign-in");
    }
  }, [isPublicPage, router]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Redirecting to sign in...</div>
    </div>
  );
};

export default UnauthenticatedRouter;
