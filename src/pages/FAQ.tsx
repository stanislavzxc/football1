import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
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

  if (loading) {
    return (
      <Layout showBackButton>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="text-[1.2rem] text-white mb-2">
              Загрузка FAQ...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton>
      <div className="w-full h-full bg-[#1A1F25] flex flex-col" style={{inset:0,}}> 
        {/* Заголовок */}
        <div className="w-full border-b border-b-[2px] border-[#575757] py-[20px] flex-shrink-0">
          <h3 className="text-[24px] text-[#fff] px-[16px] roboto font-bold">
            Ответы на вопросы
          </h3>
        </div>

        {/* Основной контент с прокруткой */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-[12px] w-full p-[16px] pb-[100px]">
          {/* FAQ секции */}
          {faqData?.sections.map((section, index) => (
            <div
              key={index}
              onClick={() => toggleSection(index)}
              className="w-full rounded-[20px] p-[16px] cursor-pointer transition-all duration-200"
              style={{
                background: '#35363A',
                border: 'none',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                flexShrink: 0
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-semibold text-white leading-[1.4]">
                  {section.title}
                </span>
                <span 
                  className="flex items-center justify-center text-white text-[18px] font-bold"
                  style={{
                    background: '#697281',
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
                <div className="mt-[16px] pt-[16px] border-t border-[#697281]">
                  <div className="space-y-[8px]">
                    {section.content.map((item, itemIndex) => (
                      <div 
                        key={itemIndex} 
                        className="text-[13px] text-[#D1D5DB] leading-[1.5]"
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
                background: '#35363A',
                border: 'none'
              }}
            >
              <div className="text-[16px] font-semibold text-white mb-[8px]">
                {faqData.contact_info.title}
              </div>
              <div className="text-[13px] text-[#D1D5DB] mb-[16px] leading-[1.4]">
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
                className="w-full bg-white text-[#1E3A8A] border-2 border-[rgba(255,255,255,0.3)] rounded-[20px] py-[12px] px-[16px] text-[14px] font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98]"
                style={{
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