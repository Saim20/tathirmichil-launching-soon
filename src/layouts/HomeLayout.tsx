import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

interface HomeLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
  navbarTransparent?: boolean;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ 
  children, 
  className = "",
  showNavbar = false,
  showFooter = false,
  navbarTransparent = true
}) => {
    return (
        <div className={`min-h-screen bg-tathir-beige flex flex-col ${className}`}>
            {showNavbar && (
                <div className={`relative z-40 ${!navbarTransparent ? 'shadow-[0_4px_0_0_rgba(90,58,43,0.5)]' : ''}`}>
                    <Navbar transparent={navbarTransparent} />
                </div>
            )}
            
            <main className="flex-grow">
                {children}
            </main>
            
            {showFooter && <Footer />}
        </div>
    );
};

export default HomeLayout;