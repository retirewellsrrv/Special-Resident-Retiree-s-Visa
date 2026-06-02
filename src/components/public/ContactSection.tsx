import { Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
} from "@/components/ui/field";

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

export function ContactSection() {
  const exampleServices = [
    "Next.js",
    "SvelteKit",
    "Nuxt.js",
    "Remix",
    "Astro",
  ] as const;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-ht-content mx-auto px-ht-margin-mobile md:px-ht-margin-desktop">
        <Card className="rounded-2xl border border-ht-outline-variant shadow-ht-elevated overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left copy */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <h2 className="text-ht-headline-lg font-display text-brand-secondary-500 mb-4">
                Ready to start your journey?
              </h2>
              <p className="text-ht-body-md text-brand-neutral-600 mb-8">
                Schedule your free, no-obligation consultation with our visa
                experts today. Let's make your Philippine retirement dreams a
                reality.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-brand-primary-500" />
                  </div>
                  <span className="text-ht-body-md text-brand-secondary-500">
                    +63 2 888 1234
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-brand-primary-500" />
                  </div>
                  <span className="text-ht-body-md text-brand-secondary-500">
                    consult@retirewell.ph
                  </span>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="bg-brand-tertiary-400 p-10 lg:p-14">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <FieldGroup className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel className="text-ht-label-md text-brand-secondary-500 font-medium">
                      Full Name
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="Your name"
                        className="bg-white border-ht-outline-variant focus-visible:ring-brand-primary-500 rounded"
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel className="text-ht-label-md text-brand-secondary-500 font-medium">
                      Email Address
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        className="bg-white border-ht-outline-variant focus-visible:ring-brand-primary-500 rounded"
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel className="text-ht-label-md text-brand-secondary-500 font-medium">
                    Interested Service
                  </FieldLabel>
                  <FieldContent>
                    <Combobox items={exampleServices}>
                      <ComboboxInput placeholder="Select a service" />
                      <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className="text-ht-label-md text-brand-secondary-500 font-medium">
                    Message (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      placeholder="Tell us how we can help..."
                      className="bg-white border-ht-outline-variant focus-visible:ring-brand-primary-500 min-h-[100px] rounded"
                    />
                  </FieldContent>
                </Field>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white font-bold h-12 rounded"
                >
                  Send Request
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
