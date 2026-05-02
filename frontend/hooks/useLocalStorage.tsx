import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const useLocalStorage = () => {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    setAccessToken(access || "");
    setRefreshToken(refresh || "");
    setHydrated(true);
  }, []);

  const setToken = (token: { access: string; refresh: string }) => {
    localStorage.setItem("access", token.access);
    localStorage.setItem("refresh", token.refresh);
    setAccessToken(token.access);
    setRefreshToken(token.refresh);
    router.push("/home");
  };

  const removeToken = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken("");
    setRefreshToken("");
    router.push("/login");
  };

  return {
    setToken,
    accessToken,
    refreshToken,
    removeToken,
    hydrated,
  };
};

export default useLocalStorage;
