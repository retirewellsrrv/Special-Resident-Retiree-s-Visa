import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function AccordionCard({items}: {items:AccordionData[]}) {
    return <Accordion
        type="single"
        collapsible
        defaultValue="item-1"
        className="max-w-lg"
    >
        {items.map((item) => (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="font-serif text-lg text-gray-800">{item.trigger}</AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
            </div>
        ))}
    </Accordion>
}