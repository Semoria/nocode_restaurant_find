import { Heart, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-light py-12 px-5 mt-12 animate-fade-in-up">
      <div className="max-w-2xl mx-auto px-4 md:px-0 space-y-6">

        {/* 科普卡片 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-brand-primary" />
            <h3 className="font-bold text-brand-text">血糖与饮品的关系</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            餐后血糖在 30-60 分钟达到峰值，高糖饮品可能导致血糖快速飙升至
            10+ mmol/L。选择低 GI、少糖的饮品有助于维持血糖平稳，
            减少"糖分过山车"带来的疲倦感。
          </p>
        </div>

        {/* 科普卡片 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-border">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-brand-primary" />
            <h3 className="font-bold text-brand-text">如何聪明地喝奶茶？</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            选择三分糖或无糖 · 用鲜奶替代奶精 · 少加珍珠等淀粉配料 ·
            搭配膳食纤维一起饮用 · 避免空腹喝高糖饮品。
            小小的选择改变，就能让你享受美味的同时更健康。
          </p>
        </div>

        {/* 底部 slogan */}
        <p className="text-center text-sm text-gray-400 pt-4">
          SipWise — 喝得明白，喝得健康 🍵
        </p>
      </div>
    </footer>
  );
};

export default Footer;
