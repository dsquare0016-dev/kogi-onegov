import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const nav = useNavigate();
  useEffect(() => {
    const s = getSession();
    nav({ to: s ? "/dashboard" : "/login", replace: true });
  }, [nav]);
  return null;
}
