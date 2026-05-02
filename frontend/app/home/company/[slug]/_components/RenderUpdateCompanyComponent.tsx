"use client";

import { useContextValues } from "@/context/ContextProvider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useEffect, useState } from "react";
import { CompanyProps } from "../../_components/RenderCompanyProfile";
import { baseurl } from "@/lib/baseurl";
import { useParams } from "next/navigation";
import Loading from "@/components/loading";
import UpdateCompanyProfile from "@/components/UpdateCompany";

const RenderUpdateCompanyComponent = () => {
  const { accessToken } = useLocalStorage();
  const { loading, setLoading } = useContextValues();
  const [company, setCompany] = useState<CompanyProps | null>(null);
  const { slug } = useParams();

  useEffect(() => {
    const fetchComopany = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/api/jobs/companies/${slug}/`, {
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

  console.log(company);

  return (
    <div>
      <UpdateCompanyProfile
        slug={slug as string}
        initialData={company || undefined}
      />
    </div>
  );
};

export default RenderUpdateCompanyComponent;
