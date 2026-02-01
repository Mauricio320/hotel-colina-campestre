import { useQuery } from "@tanstack/react-query";
import { rolesApi } from "@/services/roles/rolesApi";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.getRoles(),
  });
};
