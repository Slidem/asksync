import React from "react";
import { Unauthenticated } from "convex/react";
import UnauthenticatedRouter from "@/auth/components/UnauthenticatedRouter";

interface Props {
  children?: React.ReactNode;
}

const UnauthenticatedWrapper: React.FC<Props> = ({ children }) => {
  return (
    <Unauthenticated>
      <UnauthenticatedRouter>{children}</UnauthenticatedRouter>
    </Unauthenticated>
  );
};

export default UnauthenticatedWrapper;
