import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const items = [{
      value: 'item-1',
      trigger: 'What is SRRV?',
      content: 'The Special Resident Retiree\'s Visa is a non-immigrant visa for foreign nationals who want to retire in the Philippines. It is issued by the Philippines Retirement Authority (PRA) and offers multiple-entry privileges with the right to stay permanently in the country.'
    },
    {
      value: 'item-2',
      trigger: 'Can I work or study with an SRRV?',
      content: 'Yes, SRRV holders can study or work in the Philippines. However, to work, you mush obtain an Alien Employment Permit (AEP) from the Department of Labor and Employment.'
    }]

export default function AccordionCard() {
    return <Accordion
        type="single"
        collapsible
        defaultValue="item-1"
        className="max-w-lg"
    >
        {items.map((item) => (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="font-serif text-lg text-gray-800 hover: no-underline">{item.trigger}</AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
            </div>
        ))}
    </Accordion>
}