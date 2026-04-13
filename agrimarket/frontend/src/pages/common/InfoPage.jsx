import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Leaf, Mail, Shield, FileText, HelpCircle, ArrowLeft } from 'lucide-react';

const CONTENT = {
  about: {
    title: 'About AgriMarket',
    icon: Leaf,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    sections: [
      {
        heading: 'Our Vision',
        text: 'AgriMarket was founded with a single mission: to bridge the gap between hard-working farmers and conscious consumers. We believe in a world where fresh, organic produce is accessible to everyone at fair prices, while ensuring farmers receive the value they deserve.'
      },
      {
        heading: 'Direct from Farm',
        text: 'By removing unnecessary middlemen, we reduce food miles and ensure that the produce arriving at your doorstep was harvested just hours or days ago, preserving its nutritional value and taste.'
      },
      {
        heading: 'Technology for Good',
        text: 'We leverage advanced AI disease detection and real-time market analytics to empower farmers, helping them protect their crops and optimize their yields for a sustainable future.'
      }
    ]
  },
  contact: {
    title: 'Contact Us',
    icon: Mail,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    sections: [
      {
        heading: 'Customer Support',
        text: 'Need help with an order? Our support team is available 24/7. Email us at support@agrimarket.example.com or call us at +91 1800-AGRI-SAFE.'
      },
      {
        heading: 'Farmer Inquiries',
        text: 'Are you a farmer looking to join the platform? We offer dedicated onboarding support. Reach out to farmers@agrimarket.example.com.'
      },
      {
        heading: 'Headquarters',
        text: 'AgriMarket Technologies Pvt Ltd.\n123 Greenscape Avenue, Tech Park,\nBengaluru, KA 560001, India.'
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    sections: [
      {
        heading: 'Data Collection',
        text: 'We collect only the information necessary to provide our services, such as your name, delivery address, and contact details. Your data is encrypted and stored securely.'
      },
      {
        heading: 'Usage',
        text: 'We use your information to process orders, improve our platform experience, and provide personalized recommendations for fresh produce near you.'
      },
      {
        heading: 'Third Parties',
        text: 'We never sell your data to third parties. We only share essential delivery information with our verified logistics partners.'
      }
    ]
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    sections: [
      {
        heading: 'User Conduct',
        text: 'Users must provide accurate information during registration. Any fraudulent activity or harassment of farmers/customers will result in immediate account suspension.'
      },
      {
        heading: 'Farmer Responsibilities',
        text: 'Farmers are responsible for the quality and accuracy of their product listings. All organic certifications must be verified and up-to-date.'
      },
      {
        heading: 'Payments & Refunds',
        text: 'Payments are processed securely through our verified payment partners. Refunds are handled on a case-by-case basis as per our quality guarantee policy.'
      }
    ]
  },
  faq: {
    title: 'Frequently Asked Questions',
    icon: HelpCircle,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    sections: [
      {
        heading: 'How do I know the produce is fresh?',
        text: 'All produce on AgriMarket is listed by farmers directly. You can see the "Harvested At" timestamp on most listings, and our cold-chain delivery ensures freshness is preserved.'
      },
      {
        heading: 'Is the AI diagnosis accurate?',
        text: 'Our AI Doctor uses state-of-the-art neural networks trained on thousands of plant disease images. While highly accurate, we recommend consulting an agricultural expert for critical crop decisions.'
      },
      {
        heading: 'What if I am not happy with my order?',
        text: 'We offer a "Freshness Guarantee". If the produce you receive is not up to standard, you can request a refund or replacement within 4 hours of delivery.'
      }
    ]
  }
};

export default function InfoPage() {
  const { pathname } = useLocation();
  
  const type = useMemo(() => {
    if (pathname.includes('/about')) return 'about';
    if (pathname.includes('/contact')) return 'contact';
    if (pathname.includes('/privacy')) return 'privacy';
    if (pathname.includes('/terms')) return 'terms';
    if (pathname.includes('/faq')) return 'faq';
    return 'about';
  }, [pathname]);

  const page = CONTENT[type];
  const Icon = page.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-gray-50 flex items-center gap-6">
            <div className={`w-16 h-16 ${page.bg} rounded-2xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-8 h-8 ${page.color}`} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-primary-800 tracking-tighter">
                {page.title}
              </h1>
              <p className="text-gray-500 font-medium mt-1">Platform guidelines & information</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-10">
            {page.sections.map((section, idx) => (
              <div key={idx} className="group">
                <h2 className="text-xl font-bold text-primary-800 mb-3 flex items-center gap-3">
                  <span className={`w-1 h-6 ${page.bg.replace('bg-', 'bg-').split(' ')[0]} rounded-full`} style={{backgroundColor: 'currentColor'}} />
                  {section.heading}
                </h2>
                <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Still have questions? We're here to help you grow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-primary py-3 px-8 text-xs uppercase tracking-widest font-black">
                Talk to Support
              </Link>
              <Link to="/" className="btn-secondary py-3 px-8 text-xs uppercase tracking-widest font-black">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
