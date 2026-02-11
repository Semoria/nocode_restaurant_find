import React from 'react';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14">
      <div className="flex items-center justify-between h-full px-6">
        <div className="text-xl font-semibold text-gray-900">
          SipWise
        </div>
        <div className="flex items-center space-x-4">
          {/* 右侧暂时留空，后续添加收藏入口 */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
