import { getWorkspaceUser } from "@/features/workspace/server/session";
import { redirect } from "next/navigation";
import { ContactListClient } from "@/features/crm/components/contact-list";
import { getContactsAction } from "@/features/crm/actions/contact.actions";

export default async function ContactsPage() {
  const user = await getWorkspaceUser();

  if (!user || !user.activeTenant) {
    redirect("/login");
  }

  const res = await getContactsAction(user.activeTenant.id);
  const contacts = res.success ? res.data : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Contatos</h2>
          <p className="text-muted-foreground">Gerencie a sua base de clientes e leads.</p>
        </div>
      </div>
      
      <ContactListClient tenantId={user.activeTenant.id} initialContacts={contacts} />
    </div>
  );
}
