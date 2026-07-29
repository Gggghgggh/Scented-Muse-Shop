import { useEffect, useState } from 'react';
import HeroIllustration from '@/components/hero-illustration';

export type HeroSlide = {
    id: number;
    image_url: string;
    eyebrow: string | null;
    heading: string | null;
    subheading: string | null;
};

const SLIDE_INTERVAL_MS = 5000;

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) {
            return;
        }

        const interval = window.setInterval(() => {
            setActiveIndex((index) => (index + 1) % slides.length);
        }, SLIDE_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [slides.length]);

    if (slides.length === 0) {
        return (
            <>
                <HeroIllustration
                    role="img"
                    aria-label="Scented Muse perfumes, deodorants, watches and body care"
                    className="absolute inset-0 h-full w-full"
                />
                <div className="absolute inset-0 bg-white/42" />
                <div className="relative flex h-full max-w-xl flex-col justify-center px-5 sm:px-8 md:px-14">
                    <p className="mb-2 text-sm font-bold text-[#c7984a] sm:mb-3 sm:text-lg">
                        Curated by Scented Muse
                    </p>
                    <h1 className="text-3xl leading-tight font-black text-[#3b2147] sm:text-5xl md:text-6xl">
                        Soft living, sharp style.
                    </h1>
                    <p className="mt-3 max-w-md text-sm font-semibold text-[#273244] sm:mt-4 sm:text-base">
                        Shop perfumes, deodorants, watches, body wash, body
                        spray and body splash.
                    </p>
                    <a
                        href="#featured-products"
                        className="mt-5 inline-flex w-fit items-center bg-[#e85d4f] px-7 py-2.5 text-sm font-black text-white shadow-xl shadow-[#e85d4f]/25 transition hover:-translate-y-0.5 hover:bg-[#3b2147] sm:mt-7 sm:px-10 sm:py-3 sm:text-lg"
                    >
                        SHOP NOW
                    </a>
                </div>
            </>
        );
    }

    const activeSlide = slides[activeIndex] ?? slides[0];

    return (
        <>
            {slides.map((slide, index) => (
                <img
                    key={slide.id}
                    src={slide.image_url}
                    alt={slide.heading ?? 'Scented Muse'}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                        index === activeIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}
            <div className="absolute inset-0 bg-white/42" />
            <div className="relative flex h-full max-w-xl flex-col justify-center px-5 sm:px-8 md:px-14">
                {activeSlide.eyebrow && (
                    <p className="mb-2 text-sm font-bold text-[#c7984a] sm:mb-3 sm:text-lg">
                        {activeSlide.eyebrow}
                    </p>
                )}
                {activeSlide.heading && (
                    <h1 className="text-3xl leading-tight font-black text-[#3b2147] sm:text-5xl md:text-6xl">
                        {activeSlide.heading}
                    </h1>
                )}
                {activeSlide.subheading && (
                    <p className="mt-3 max-w-md text-sm font-semibold text-[#273244] sm:mt-4 sm:text-base">
                        {activeSlide.subheading}
                    </p>
                )}
                <a
                    href="#featured-products"
                    className="mt-5 inline-flex w-fit items-center bg-[#e85d4f] px-7 py-2.5 text-sm font-black text-white shadow-xl shadow-[#e85d4f]/25 transition hover:-translate-y-0.5 hover:bg-[#3b2147] sm:mt-7 sm:px-10 sm:py-3 sm:text-lg"
                >
                    SHOP NOW
                </a>
            </div>
        </>
    );
}
