import { cn } from '@/lib/utils';

/**
 * PageHeader - A reusable header component for listing pages
 * @param {string} title - The main title of the page
 * @param {string} [description] - Optional description/subtitle text
 * @param {string} [className] - Additional CSS classes
 * @param {React.ReactNode} [children] - Optional additional content to render below the description
 */
export function PageHeader({ title, description, className, children }) {
  return (
    <div className={cn('mb-8 relative w-full', className)}>
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1380ec]/10 via-[#1380ec]/5 to-transparent rounded-2xl -mx-4 px-4 py-8"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-60"></div>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#1380ec]/5 rounded-full blur-3xl"></div>
      
      <div className="relative text-center py-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
          <span className="text-primary">
            {title}
          </span>
        </h1>
        {description && (
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}
        {children}
      </div>

      {/* Decorative underline */}
      <div className="relative flex justify-center mt-2">
        <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
      </div>
    </div>
  );
}

