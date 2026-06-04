"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { MouseEventHandler } from "react";

interface LogoutBtnProps {
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function LogoutBtn({ className, onClick }: LogoutBtnProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <Button
      className={className}
      variant="outline"
      size="lg"
      onClick={(e) => {
        onClick?.(e);
        handleLogout();
      }}
      disabled={pending}
    >
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
