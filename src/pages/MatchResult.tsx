import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { TelegramCard } from "../components/TelegramCard";
import { TelegramButton } from "../components/TelegramButton";
import { TelegramLoader } from "../components/TelegramLoader";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";
import mvp from '../assets/mvp.png';
import mvp_black from '../assets/mvp_black.png';
import best_save from '../assets/bestsave.png';
import best_save_black from '../assets/bestsave_black.png';
import best_goal from '../assets/bestgoal.png';
import best_goal_black from '../assets/bestgoal_black.png';

interface Match {
  id: number;
  start_time: string;
  end_time: string;
  venue?: {
    name: string;
    address: string;
  };
  results?: {
    winning_team: string;
    red_team_score: number;
    green_team_score: number;
    blue_team_score: number;
    notes?: string;
    best_player?: {
      id: number;
      full_name: string;
    };
    best_goal_player?: {
      id: number;
      full_name: string;
    };
    best_save_player?: {
      id: number;
      full_name: string;
    };
  };
}

export default function MatchResult() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { isDarkMode } = useTheme();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;

      try {
        const data = await api.getMatch(Number(matchId));
        setMatch(data);
      } catch (error) {
        console.error("Error fetching match:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const getWinnerName = (winningTeam: string) => {
    switch (winningTeam) {
      case "red":
        return "Красные";
      case "green":
        return "Зеленые";
      case "blue":
        return "Синие";
      case "draw":
        return "Ничья";
      default:
        return "Неизвестно";
    }
  };

  const getWinnerIcon = (winningTeam: string) => {
    switch (winningTeam) {
      case "red":
        return "🔴";
      case "green":
        return "🟢";
      case "blue":
        return "🔵";
      case "draw":
        return "🤝";
      default:
        return "⚽";
    }
  };

  // Получение иконок в зависимости от темы
  const getMVPIcon = () => isDarkMode ? mvp : mvp_black;
  const getBestGoalIcon = () => isDarkMode ? best_goal : best_goal_black;
  const getBestSaveIcon = () => isDarkMode ? best_save : best_save_black;

  // Стили для темной/светлой темы
  const backgroundColor = isDarkMode ? 'rgb(26 31 37)' : '#F3F4F8';
  const cardBackgroundColor = isDarkMode ? '#35363A' : '#FFFFFF';
  const textColor = isDarkMode ? 'white' : '#1A1F25';
  const secondaryTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#697281';
  const notesBackgroundColor = isDarkMode ? '#2A2B30' : '#F8F9FA';
  const notesTextColor = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#4B5563';

  if (loading) {
    return (
      <Layout showBackButton>
        <TelegramLoader message="Загрузка результатов..." />
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout title="Матч не найден" showBackButton>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          paddingTop: '50px',
          gap: '20px'
        }}>
          <div style={{
            color: textColor,
            fontSize: "1.2rem",
            textAlign: "center",
          }}>
            Матч не найден
          </div>
          <TelegramButton onClick={() => navigate("/matches")}>
            Назад к истории матчей
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  const formatMatchDate = () => {
    const date = new Date(match.start_time);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const formatMatchTime = () => {
    const startTime = new Date(match.start_time).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = new Date(match.end_time).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${startTime} - ${endTime}`;
  };

  return (
    <Layout showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '5px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px',
        backgroundColor: backgroundColor,
        minHeight: '100vh',
      }}>
        {/* Информация о матче */}
        <TelegramCard style={{ 
          textAlign: 'center', 
          backgroundColor: cardBackgroundColor, 
          width: '100%',
          padding: '20px 16px'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Адрес */}
            <div style={{ 
              fontSize: '0.9rem', 
              color: textColor,
              lineHeight: '1.4'
            }}>
              {match.venue?.address || 'Адрес не указан'}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {/* Дата */}
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: '500',
                color: textColor
              }}>
                {formatMatchDate()}
              </div>
              
              {/* Иконка времени */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: textColor
              }}>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  color: textColor,
                }}>
                  {formatMatchTime()}
                </span>
              </div>
            </div>
          </div>
        </TelegramCard>

        {/* Результат матча */}
        <TelegramCard style={{ 
          textAlign: 'center',
          padding: '32px 24px',
          height: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: cardBackgroundColor,
          width: '100%'
        }}>
          <div style={{ 
            fontSize: '1.4rem',
            fontWeight: '700',
            marginBottom: '12px',
            color: textColor
          }}>
            {match.results
              ? "Победители"
              : "Результат не определен"}
          </div>
          
          {match.results && (
            <div style={{ 
              fontSize: '1.2rem', 
              fontWeight: '600', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: textColor
            }}>
              <span>{getWinnerIcon(match.results.winning_team)}</span>
              <span>{getWinnerName(match.results.winning_team)}</span>
            </div>
          )}
        </TelegramCard>

        <TelegramCard style={{ backgroundColor: cardBackgroundColor }}>
          {/* Результаты игроков */}
          {match.results && (
            <>
              {(match.results.best_player || match.results.best_goal_player || match.results.best_save_player) && (
                <TelegramCard style={{ 
                  backgroundColor: cardBackgroundColor, 
                  width: '100%',
                  padding: '10px 8px'
                }}>
                  <div style={{ 
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    marginBottom: '20px',
                    textAlign: 'center',
                    color: textColor
                  }}>
                    Лучшие игроки матча
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {match.results.best_player && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        borderRadius: '12px'
                      }}>
                        <div style={{ flex: 1, display:"flex", gap:'5px', justifyContent:'center',}}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '500',
                            color: textColor,
                          }}>
                            <div style={{display:'flex', gap:'10px', alignItems: 'center'}}>
                              <img src={getMVPIcon()} alt="MVP" style={{width:'15px', height:'15px'}} />
                              MVP матча:
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '1rem', 
                            color: secondaryTextColor,
                            fontWeight: '500'
                          }}>
                            <div style={{color: textColor, fontWeight: '500' }}>
                              {match.results.best_player.full_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {match.results.best_goal_player && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        borderRadius: '12px',
                        justifyContent:'center',
                      }}>
                        <div style={{ flex: 1, display:'flex', gap:'10px', justifyContent:'center',}}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '500',
                            color: textColor,
                            marginBottom: '4px'
                          }}>
                            <div style={{display:'flex', gap:'10px', alignItems: 'center'}}>
                              <img src={getBestGoalIcon()} alt="Лучший гол" style={{width:'15px', height:'15px'}} />
                              Лучший гол:
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            color: textColor,
                            fontWeight: '500'
                          }}>
                            <div style={{color: textColor, fontWeight: '500' }}>
                              {match.results.best_goal_player.full_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {match.results.best_save_player && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        borderRadius: '12px'
                      }}>
                        <div style={{ flex: 1, display:'flex', gap:'10px', justifyContent:'center',}}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '500',
                            color: textColor,
                          }}>
                            <div style={{display:'flex', gap:'10px', alignItems: 'center'}}>
                              <img src={getBestSaveIcon()} alt="Лучший сейв" style={{width:'15px', height:'15px'}} />
                              Лучший сейв:
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '1rem', 
                            color: secondaryTextColor,
                            fontWeight: '500'
                          }}>
                            <div style={{color: textColor, fontWeight: '500' }}>
                              {match.results.best_save_player.full_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TelegramCard>
              )}
              
              {/* Заметки к матчу */}
              {match.results.notes && (
                <TelegramCard style={{ 
                  backgroundColor: cardBackgroundColor, 
                  width: '100%',
                  padding: '20px 16px',
                  marginTop: '15px',
                }}>
                  <div style={{ 
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    marginBottom: '16px',
                    textAlign: 'center',
                    color: textColor
                  }}>
                    Заметки к матчу
                  </div>
                  <div style={{ 
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    color: notesTextColor,
                    whiteSpace: 'pre-wrap',
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: notesBackgroundColor
                  }}>
                    {match.results.notes}
                </div>
              </TelegramCard>
            )}
          </>
        )}
        </TelegramCard>

        <Navbar/>
      </div>
    </Layout>
  );
}