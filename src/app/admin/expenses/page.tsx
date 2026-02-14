import ExpenseForm from "@/components/admin/expenses/ExpenseForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ExpensesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const inputBy =
    (session?.user as any)?.name ||
    (session?.user as any)?.email ||
    (session?.user as any)?.id ||
    null;
  return (
    <main className="w-full px-4 py-6">
      <section className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Invoice Expense</h1>
      </section>
      <ExpenseForm inputBy={inputBy} />
    </main>
  );
}
