import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function DebugPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>No user</div>;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  return (
    <div className="p-8 font-mono text-xs">
      <h1 className="text-xl font-bold mb-4">Debug Auth State</h1>
      <section className="mb-8">
        <h2 className="font-bold border-b mb-2">Auth User</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </section>
      <section>
        <h2 className="font-bold border-b mb-2">Profile Table</h2>
        <pre>{JSON.stringify({ profile }, null, 2)}</pre>
      </section>
    </div>
  );
}
