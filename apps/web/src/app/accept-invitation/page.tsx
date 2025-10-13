import { OrganizationList } from "@clerk/nextjs";

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <OrganizationList
        afterSelectOrganizationUrl="/"
        afterCreateOrganizationUrl="/"
      />
    </div>
  );
}
