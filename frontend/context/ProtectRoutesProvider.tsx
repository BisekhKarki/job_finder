"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { baseurl } from "@/lib/baseurl";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useContextValues } from "./ContextProvider";
import Loading from "@/components/loading";

export const ProtectContext = createContext<any>(null);

export const ProtectRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, refreshToken, setToken, removeToken, hydrated } =
    useLocalStorage();

  const { decodedToken } = useContextValues();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!hydrated) return;
      if (!accessToken || !refreshToken) {
        router.push("/login");
        return;
      }

      try {
        const decoded: any = decodedToken(accessToken);
        const currentTime = Date.now() / 1000;

        if (!decoded || !decoded.exp) {
          router.push("/login");
          return;
        }

        if (decoded.exp > currentTime) {
          setLoading(false);
          return;
        }
        setLoading(true);

        const response = await fetch(`${baseurl}/api/accounts/refresh/token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        const data = await response.json();

        if (response.ok && data.access) {
          setToken({
            access: data.access,
            refresh: refreshToken,
          });

          setLoading(false);
        } else {
          removeToken();
          router.push("/login");
        }
      } catch (err) {
        console.log(err);
        removeToken();
        router.push("/login");
      }
    };

    checkAuth();
  }, [accessToken, refreshToken, decodedToken, setToken, removeToken, router]);
  if (loading) return <Loading />;

  return (
    <ProtectContext.Provider value={{ loading, setLoading }}>
      {children}
    </ProtectContext.Provider>
  );
};

export const useProtectContext = () => {
  const context = useContext(ProtectContext);
  if (!context) {
    throw new Error("Must be used inside ProtectRoute");
  }
  return context;
};
