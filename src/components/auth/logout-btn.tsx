"use client";

import { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction, getSession } from "@/actions/auth";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { MouseEventHandler } from "react";

interface LogoutBtnProps {
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function LogoutBtn({ className, onClick }: LogoutBtnProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.replace("/login");
      router.refresh();
    });
  };
  useEffect(() => {
    getSession().then(setUser);
  }, []);

  return (
    <Button
      className={className}
      variant="outline"
      size="lg"
      onClick={(e) => {
        onClick?.(e);
        handleLogout();
      }}
      disabled={pending || !user}
    >
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
