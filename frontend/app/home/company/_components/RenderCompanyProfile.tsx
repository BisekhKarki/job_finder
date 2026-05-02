"use client";

import CompanyProfile from "@/components/CompanyProfile";
import CreateCompanyProfile from "@/components/CreateCompanyProfilePage";
import Loading from "@/components/loading";
import UpdateCompanyProfile from "@/components/UpdateCompany";
import { useContextValues } from "@/context/ContextProvider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { baseurl } from "@/lib/baseurl";
import React, { useEffect, useState } from "react";

export type CompanyProps = {
  company_name: string;
  slug: string;
  website: string;
  description: string;
  location: string;
  logo: string | null;
  created_at: string;
};

const RenderCompanyProfile = () => {
  const { accessToken } = useLocalStorage();
  const { loading, setLoading } = useContextValues();
  const [company, setCompany] = useState<CompanyProps | null>(null);

  useEffect(() => {
    const fetchComopany = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/api/jobs/company/my/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const val = await response.json();
        if (response.ok) {
          setCompany(val.company);
          setLoading(false);
          console.log(val);
        } else {
          setCompany(null);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) {
      fetchComopany();
    }
  }, [accessToken]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {company === null ? (
        <CreateCompanyProfile />
      ) : (
        company && <CompanyProfile company={company} />
      )}
    </>
  );
};

export default RenderCompanyProfile;
