import { useNavigate } from 'react-router-dom';
import { heroContent } from '@/data/mockdata';

export default function HeroSection() {
    const navigate = useNavigate();
    return (
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroContent.backgroundImage}
            alt="City street with vehicles"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-6 text-center">
          {/* Title and Subtitle */}
          <div className="flex flex-col gap-4 max-w-3xl">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] sm:text-5xl lg:text-6xl">
              {heroContent.title}
            </h1>
            <p className="text-gray-100 text-sm sm:text-base lg:text-lg leading-normal">
              {heroContent.subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {heroContent.actions.map((action) => (
              <button
                key={action.label}
                onClick={() => action.path && navigate(action.path)}
                className='inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50'
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
}
