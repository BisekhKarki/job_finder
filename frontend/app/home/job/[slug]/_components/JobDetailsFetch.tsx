"use client";

import JobDetail from "@/components/JobDetail";
import Loading from "@/components/loading";
import { useContextValues } from "@/context/ContextProvider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { baseurl } from "@/lib/baseurl";
import { Application, Job } from "@/types";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const JobDetailsFetch = () => {
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const { accessToken } = useLocalStorage();
  const { loading, setLoading, userRole } = useContextValues();
  const { slug } = useParams();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${baseurl}/api/jobs/${slug}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const val = await response.json();

        if (response.ok) {
          setJob(val.jobs || null);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchApplication = async () => {
      try {
        let url = "";
        if (userRole === "applicant") {
          url = `/api/application/job/${slug}/`;
        } else if (userRole === "employer") {
          url = `/api/application/${slug}/jobs/check/applications/`;
        }

        const response = await fetch(`${baseurl}${url}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const val = await response.json();

        if (response.ok) {
          userRole === "applicant"
            ? setApplication(val.application)
            : setApplications(val.applications);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (accessToken && userRole !== "") {
      fetchJobs();
      fetchApplication();
    }
  }, [accessToken, userRole]);

  if (loading)
    return (
      <div className="mt-20">
        <Loading variant="dots" />
      </div>
    );

  return (
    <>
      <JobDetail
        job={job || null}
        application={application || null}
        applications={applications}
      />
    </>
  );
};

export default JobDetailsFetch;
