import { Heart, ClipboardList, Users } from 'lucide-react';

const Header = ({ onFavoritesClick, onHealthProfileClick, onFamilyGroupClick }) => {
  return (
    <header className="flex justify-between items-center px-5 py-4">
      <div className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        SipWise
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onFamilyGroupClick}
          className="p-2.5 hover:bg-brand-light rounded-full transition-colors hover:scale-110 transition-transform"
        >
          <Users className="h-6 w-6 text-brand-primary" />
        </button>
        <button
          onClick={onHealthProfileClick}
          className="p-2.5 hover:bg-brand-light rounded-full transition-colors hover:scale-110 transition-transform"
        >
          <ClipboardList className="h-6 w-6 text-brand-primary" />
        </button>
        <button
          onClick={onFavoritesClick}
          className="p-2.5 hover:bg-brand-light rounded-full transition-colors hover:scale-110 transition-transform"
        >
          <Heart className="h-6 w-6 text-brand-primary" />
        </button>
      </div>
    </header>
  );
};

export default Header;
