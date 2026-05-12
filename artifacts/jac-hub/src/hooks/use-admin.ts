import { useGetMe } from "@workspace/api-client-react";

const ADMIN_EMAIL = "gael@jac.dev";

export function useIsAdmin(): boolean {
  const { data: user } = useGetMe();
  return user?.email === ADMIN_EMAIL;
}
