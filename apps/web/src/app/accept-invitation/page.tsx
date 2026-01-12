import { OrganizationList } from "@clerk/nextjs";

const AcceptInvitationPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <OrganizationList
        afterSelectOrganizationUrl="/"
        afterCreateOrganizationUrl="/"
      />
    </div>
  );
};

export default AcceptInvitationPage;
