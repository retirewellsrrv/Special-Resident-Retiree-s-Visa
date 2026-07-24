import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone } from "lucide-react";

export function ApplicationSupportCard() {
  return (
    <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-[#8B1A2B] mb-1">
          Application Support
        </h2>
        <p className="text-sm text-neutral-500 mb-3 leading-relaxed">
          Need assistance with your SRRV application? Our consultants are
          available for real-time guidance.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 mt-0.5 text-neutral-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Email Assistance
              </p>
              <p className="text-sm text-neutral-500">
                admin.retirewellsrrv@gmail.com
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-neutral-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Phone Hotline
              </p>
              <p className="text-sm text-neutral-500">+63 918 367 7645</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
