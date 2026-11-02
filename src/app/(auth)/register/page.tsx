import { ProfileService } from "@/server/services/profile.service";
import { RegisterForm } from "@/components/forms/register-form";
import { AuthCard } from "@/components/ui/auth-card";

export default async function RegisterPage() {
  const taxonomy = await ProfileService.getTaxonomy();

  return (
    <AuthCard
      title="Create your WorkWasl account"
      subtitle="Join top engineering teams and independent specialists worldwide"
    >
      <RegisterForm skills={taxonomy.skills} />
    </AuthCard>
  );
}
