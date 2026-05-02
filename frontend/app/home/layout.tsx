import Navbar from "@/components/Navbar";
import ContextProvider from "@/context/ContextProvider";
import { ProtectRoute } from "@/context/ProtectRoutesProvider";
import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <ContextProvider>
        <ProtectRoute>
          <Navbar />
          {children}
        </ProtectRoute>
      </ContextProvider>
    </>
  );
};

export default layout;
