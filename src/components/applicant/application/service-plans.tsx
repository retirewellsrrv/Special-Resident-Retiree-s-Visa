import { Clock, Banknote, Building2, Star, Stethoscope } from "lucide-react";
import { ServicePlan } from "./types";

export const servicePlans = [
  {
    id: "basic" as ServicePlan,
    name: "Basic",
    subtitle: "FOR ACTIVE RETIREES",
    price: "$20,000.00",
    priceNote: "Required Deposit",
    description:
      "Designed for healthy retirees aged 35 and above who prefer to maintain their required visa deposit in a local bank account without conversion to investment.",
    tags: [
      { icon: <Clock className="w-3 h-3" />, label: "35+ Years Old" },
      { icon: <Banknote className="w-3 h-3" />, label: "Term Deposit" },
    ],
    highlighted: false,
  },
  {
    id: "premium" as ServicePlan,
    name: "Premium",
    subtitle: "INVESTMENT FLEXIBILITY",
    price: "$10,000.00*",
    priceNote: "With Pension",
    description:
      "Allows use of the visa deposit for investment in high-value real estate or long-term lease of house and lot. Ideal for those looking to settle permanently.",
    tags: [
      {
        icon: <Building2 className="w-3 h-3" />,
        label: "Real Estate Investment",
      },
      { icon: <Star className="w-3 h-3" />, label: "*Deposit varies by age" },
    ],
    highlighted: true,
  },
  {
    id: "vip" as ServicePlan,
    name: "VIP",
    subtitle: "MEDICAL CARE FOCUS",
    price: "$10,000.00",
    priceNote: "Fixed Deposit",
    description:
      "Specifically designed for ailing retirees who need medical and clinical care in the Philippines. Requires a monthly pension and health insurance coverage.",
    tags: [
      { icon: <Stethoscope className="w-3 h-3" />, label: "Specialized Care" },
    ],
    highlighted: false,
  },
];
