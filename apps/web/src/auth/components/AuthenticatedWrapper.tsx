import { Authenticated } from "convex/react";
import OrganizationRouter from "@/organizations/components/OrganizationRouter";
import React from "react";

interface Props {
  children?: React.ReactNode;
}

/**
 * AuthenticatedWrapper component to wrap content that requires authentication.
 * It uses the Authenticated component from Convex to ensure that the user is authenticated,
 * then handles organization routing for authenticated users only.
 */
const AuthenticatedWrapper: React.FC<Props> = ({ children }) => {
  return (
    <Authenticated>
      <OrganizationRouter>{children}</OrganizationRouter>
    </Authenticated>
  );
};

export default AuthenticatedWrapper;
