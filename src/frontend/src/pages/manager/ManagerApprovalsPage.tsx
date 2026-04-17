import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function ManagerApprovalsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/manager/dashboard" });
  }, [navigate]);
  return null;
}
