import { Heart } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-5 py-4">
      <div className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        SipWise
      </div>
      <button className="p-2 hover:bg-brand-light rounded-full transition-colors">
        <Heart className="h-6 w-6 text-brand-primary" />
      </button>
    </header>
  );
};

export default Header;
