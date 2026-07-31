type HeroContent = {
    title: string;
    description: string;
}

export default function Hero({ title, description }: HeroContent) {
    return (
        <section className="bg-[#F6F5F2] pt-16 pb-14 md:pt-24 md:pb-20 px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-4 md:mb-6 max-w-xl sm:max-w-2xl md:max-w-none mx-auto leading-tight">
                {title}
            </h1>
            <p className="max-w-md sm:max-w-xl md:max-w-[50rem] mx-auto text-gray-600 text-base md:text-lg leading-relaxed">
                {description}
            </p>
        </section>
    );
}