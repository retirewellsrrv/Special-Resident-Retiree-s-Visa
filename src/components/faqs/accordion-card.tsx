import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// 1. Rename the item interface to avoid collision with the UI component name
export interface FaqItem {
  value: string;
  trigger: string;
  content: string;
}

// 2. Clear definition for the incoming props object
interface AccordionCardProps {
  items: FaqItem[];
}

export default function AccordionCard({ items }: AccordionCardProps) {
  // Guard clause in case an empty list or undefined gets passed down
  if (!items || items.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={items[0]?.value} // Safely fall back to the first dynamic item's value
      className="w-full space-y-4"
    >
      {items.map((item) => (
        <div 
          key={item.value} 
          className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          <AccordionItem value={item.value} className="border-none">
            <AccordionTrigger className="w-full px-6 py-5 text-left font-normal flex justify-between items-center font-serif text-lg text-gray-800 hover:no-underline group focus:outline-none">
              <span>{item.trigger}</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        </div>
      ))}
    </Accordion>
  )
}