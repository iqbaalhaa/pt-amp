// Password better-auth disimpan di Account (providerId "credential"), bukan di User.
type AccountStore = {
  user: { findUnique(args: { where: { id: string }; select: { id: true } }): Promise<{ id: string } | null> };
  account: {
    updateMany(args: {
      where: { userId: string; providerId: string };
      data: { password: string };
    }): Promise<{ count: number }>;
    create(args: {
      data: { id: string; userId: string; providerId: string; accountId: string; password: string };
    }): Promise<unknown>;
  };
};

export const MIN_PASSWORD_LENGTH = 8;

// Set password user; akun credential belum ada → dibuat (sama seperti admin setUserPassword better-auth).
export async function setCredentialPassword(
  db: AccountStore,
  hashPassword: (password: string) => Promise<string>,
  userId: string,
  newPassword: string,
): Promise<"updated" | "created" | "not-found"> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return "not-found";
  const password = await hashPassword(newPassword);
  const { count } = await db.account.updateMany({
    where: { userId, providerId: "credential" },
    data: { password },
  });
  if (count > 0) return "updated";
  await db.account.create({
    data: { id: crypto.randomUUID(), userId, providerId: "credential", accountId: userId, password },
  });
  return "created";
}
