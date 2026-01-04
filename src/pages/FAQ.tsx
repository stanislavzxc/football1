import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";

interface FAQSection {
  title: string;
  content: string[];
}

interface FAQData {
  sections: FAQSection[];
  contact_info: {
    title: string;
    description: string;
  };
}

export default function FAQ() {
  const { isDarkMode } = useTheme();
  const [faqData, setFaqData] = useState<FAQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const data = await api.getFAQ();
        setFaqData(data);
      } catch (error) {
        console.error("Error fetching FAQ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQ();
  }, []);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  // Стили для темной/светлой темы
  const backgroundColor = isDarkMode ? '#1A1F25' : '#F3F4F8';
  const cardBackgroundColor = isDarkMode ? '#35363A' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#1A1F25';
  const secondaryTextColor = isDarkMode ? '#D1D5DB' : '#4B5563';
  const borderColor = isDarkMode ? '#575757' : '#E5E7EB';
  const expandButtonBackground = isDarkMode ? '#697281' : '#9CA3AF';
  const contactButtonBackground = isDarkMode ? '#6FBBE5' : '#3D82FF';
  const contactButtonTextColor = isDarkMode ? '#FFFFFF' : '#FFFFFF';
  const contactButtonBorderColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(30, 58, 138, 0.3)';
  const contactDescriptionColor = isDarkMode ? '#D1D5DB' : '#6B7280';
  const sectionBorderColor = isDarkMode ? '#697281' : '#D1D5DB';

  if (loading) {
    return (
      <Layout showBackButton>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className={`text-[1.2rem] mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Загрузка FAQ...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton>
      <div 
        className="w-full h-full flex flex-col" 
        style={{ backgroundColor }}
      >
        {/* Заголовок */}
        <div 
          className="w-full border-b py-[20px] flex-shrink-0"
          style={{ 
            borderBottomWidth: '2px',
            borderColor 
          }}
        >
          <h3 
            className="text-[24px] px-[16px] roboto font-bold"
            style={{ color: textColor }}
          >
            Ответы на вопросы
          </h3>
        </div>

        {/* Основной контент с прокруткой */}
        <div 
          className="flex-1 overflow-y-auto flex flex-col gap-[12px] w-full p-[16px] pb-[100px]"
          style={{ backgroundColor }}
        >
          {/* FAQ секции */}
          {faqData?.sections.map((section, index) => (
            <div
              key={index}
              onClick={() => toggleSection(index)}
              className="w-full rounded-[20px] p-[16px] cursor-pointer transition-all duration-200 flex-shrink-0"
              style={{
                background: cardBackgroundColor,
                border: 'none',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex justify-between items-center">
                <span 
                  className="text-[15px] font-semibold leading-[1.4]"
                  style={{ color: textColor }}
                >
                  {section.title}
                </span>
                <span 
                  className="flex items-center justify-center text-[18px] font-bold"
                  style={{
                    background: expandButtonBackground,
                    color: '#FFFFFF',
                    padding: '2px 12px',
                    borderRadius: '15px',
                    minWidth: '30px',
                    minHeight: '30px'
                  }}
                >
                  {expandedSection === index ? "−" : "+"}
                </span>
              </div>
              
              {expandedSection === index && (
                <div 
                  className="mt-[16px] pt-[16px]"
                  style={{ borderTopColor: sectionBorderColor, borderTopWidth: '1px' }}
                >
                  <div className="space-y-[8px]">
                    {section.content.map((item, itemIndex) => (
                      <div 
                        key={itemIndex} 
                        className="text-[13px] leading-[1.5]"
                        style={{ color: secondaryTextColor }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Контактная информация */}
          {faqData?.contact_info && (
            <div 
              className="w-full rounded-[20px] p-[16px] text-center mt-[8px] flex-shrink-0"
              style={{
                background: cardBackgroundColor,
                border: 'none'
              }}
            >
              <div 
                className="text-[16px] font-semibold mb-[8px]"
                style={{ color: textColor }}
              >
                {faqData.contact_info.title}
              </div>
              <div 
                className="text-[13px] mb-[16px] leading-[1.4]"
                style={{ color: contactDescriptionColor }}
              >
                {faqData.contact_info.description}
              </div>
              <button
                onClick={async () => {
                  try {
                    // Получаем конфигурацию админа
                    const response = await fetch("/api/public/config/admin");

                    if (response.ok) {
                      const config = await response.json();
                      const username = config.admin_username;

                      if (username) {
                        // Открываем чат с админом по username
                        const telegramUrl = `https://t.me/${username}`;

                        // Для iPhone используем window.location.href вместо window.open
                        const isIOS = /iPad|iPhone|iPod/.test(
                          navigator.userAgent
                        );

                        if (isIOS) {
                          window.location.href = telegramUrl;
                        } else {
                          window.open(telegramUrl, "_blank");
                        }
                        return;
                      }
                    }

                    // Fallback - открываем по ID первого админа
                    const adminId = 1680940651; // из .env
                    const telegramUrl = `tg://user?id=${adminId}`;

                    // Для iPhone используем window.location.href вместо window.open
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

                    if (isIOS) {
                      window.location.href = telegramUrl;
                    } else {
                      window.open(telegramUrl, "_blank");
                    }
                  } catch (error) {
                    console.error("Error opening admin chat:", error);
                    // Fallback - открываем по ID
                    const adminId = 1680940651;
                    const telegramUrl = `tg://user?id=${adminId}`;

                    // Для iPhone используем window.location.href вместо window.open
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

                    if (isIOS) {
                      window.location.href = telegramUrl;
                    } else {
                      window.open(telegramUrl, "_blank");
                    }
                  }
                }}
                className="w-full border-2 rounded-[20px] py-[12px] px-[16px] text-[14px] font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: contactButtonBackground,
                  color: contactButtonTextColor,
                  borderColor: 'transparent',
                  backdropFilter: 'blur(10px)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation'
                }}
              >
                Написать администратору
              </button>
            </div>
          )}
        </div>

        {/* Фиксированный нижний отступ для навигации */}
        <div className="h-[80px] flex-shrink-0"></div>
        <Navbar />
      </div>
    </Layout>
  );
}