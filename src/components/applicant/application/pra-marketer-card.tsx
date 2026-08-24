import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import markerImage from "@/assets/images/pra_logo.png";

export function PraMarketerCard() {
  return (
    <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white overflow-hidden">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="relative w-full h-72 rounded-xl overflow-hidden">
          <Image
            src={markerImage}
            alt="Authorized PRA Marketer seal"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-200/60 to-transparent" />
        </div>
        <p className="text-xs font-semibold tracking-widest text-neutral-500 text-center uppercase">
          Authorized PRA Marketer
        </p>
      </CardContent>
    </Card>
  );
}
