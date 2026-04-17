import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// Work Images is not part of the Contractor feature set.
// Redirect to dashboard.
export default function ContractorWorkImagesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/contractor/dashboard" });
  }, [navigate]);

  return null;
}
