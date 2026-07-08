type HeroContent = {
    title: String;
    description: String;
}

export default function Hero({ title, description }: HeroContent) {
    return <section className="bg-[#F6F5F2] pt-24 pb-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">{title}</h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed">
            {description}
        </p>
    </section>
}