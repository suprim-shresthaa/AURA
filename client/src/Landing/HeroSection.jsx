import { ArrowRight, Car, Wrench, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppContent } from '../components/context/AppContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { heroContent } from '@/data/mockdata';
const heroButtonStyles = {
    primary: "bg-[#1380ec] text-white hover:bg-[#0f64b8]",
    secondary: "bg-[#e7edf3] text-[#0d141b] hover:bg-[#d5e0ed]",
  };
export default function HeroSection() {
    const {userData} = useContext(AppContent);
    const navigate = useNavigate();

    // console.log(userData);
    
    return (
            <div className="rounded-lg bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:p-8 flex min-h-[480px] flex-col gap-6 items-center justify-center text-center min-w-7xl mx-auto"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%), url(${heroContent.backgroundImage})`,
              }}>
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] sm:text-5xl">
                  {heroContent.title}
                </h1>
                <p className="text-gray-100 text-sm sm:text-base leading-normal max-w-3xl mx-auto">
                  {heroContent.subtitle}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {heroContent.actions.map((action) => (
                  <Button
                    key={action.label}
                    size="lg"
                    onClick={() => action.path && navigate(action.path)}
                    className={`min-w-[160px] h-12 px-6 font-bold tracking-[0.015em] ${heroButtonStyles[action.variant]}`}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
    );
}
