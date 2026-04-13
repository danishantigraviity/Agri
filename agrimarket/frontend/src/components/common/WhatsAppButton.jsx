import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = "6374837217";
  const message = "Hello! I have a query about AgriMarket.";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] group"
      aria-label="Contact us on WhatsApp"
    >
      <div className="relative flex items-center">
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
          Chat with us!
        </span>
        
        {/* Button */}
        <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-110 active:scale-95 transition-all duration-300 relative overflow-hidden group">
          {/* Animated Glow */}
          <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full" />
          
          <MessageCircle className="w-7 h-7 text-white fill-white/20" />
          
          {/* Ripple Effect */}
          <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-20 pointer-events-none" />
        </div>
      </div>
    </a>
  );
}
