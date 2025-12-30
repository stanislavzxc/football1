import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';
import { api } from '../services/api';
import { showNotification } from '../utils/api';

interface UserStats {
  id: number;
  user_id: number;
  total_matches: number;
  wins: number;
  draws: number;
  losses: number;
  mvp_count: number;
  best_goal_count: number;
  best_save_count: number;
  total_goals: number;
  total_saves: number;
  last_match_date?: string;
}

export default function PlayerStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading user stats:', error);
      showNotification('Ошибка загрузки статистики', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateWinRate = () => {
    if (!stats) return 0;
    const totalGames = stats.losses + stats.wins;
    if (totalGames === 0) return 0;
    // Формула: wins/(losses+wins)*100 с округлением вверх
    return Math.ceil((stats.wins / totalGames) * 100);
  };

  if (loading) {
    return (
      <Layout title="Моя статистика" showBackButton>
        <div style={{
          color: 'white',
          fontSize: '1.2rem',
          textAlign: 'center',
          marginTop: '50px'
        }}>
          Загрузка статистики...
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout title="Моя статистика" showBackButton>
        <div style={{
          color: 'white',
          fontSize: '1.1rem',
          textAlign: 'center',
          marginTop: '50px',
          opacity: 0.8
        }}>
          Статистика недоступна
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <TelegramButton to="/profile" variant="secondary">
            Назад в профиль
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Моя статистика" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {/* Основная статистика */}
        <TelegramCard>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '16px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            🏃 Общая статистика
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem'
            }}>
              <span>⚽ Я сыграл:</span>
              <span style={{ fontWeight: '600' }}>{stats.total_matches} матчей</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem'
            }}>
              <span>🏆 Выиграно:</span>
              <span style={{ fontWeight: '600', color: '#4CAF50' }}>{stats.wins}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem'
            }}>
              <span>🤝 Ничьих:</span>
              <span style={{ fontWeight: '600', color: '#FFC107' }}>{stats.draws}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem'
            }}>
              <span>❌ Поражений:</span>
              <span style={{ fontWeight: '600', color: '#F44336' }}>{stats.losses}</span>
            </div>
          </div>
        </TelegramCard>

        {/* Достижения */}
        <TelegramCard>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '16px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            🏅 Достижения
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem'
            }}>
              <span>🌟 MVP:</span>
              <span style={{ fontWeight: '600' }}>{stats.mvp_count} раз</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem'
            }}>
              <span>⚡ Лучший гол:</span>
              <span style={{ fontWeight: '600' }}>{stats.best_goal_count} раз</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.95rem'
            }}>
              <span>🥅 Лучший сейв:</span>
              <span style={{ fontWeight: '600' }}>{stats.best_save_count} раз</span>
            </div>
          </div>
        </TelegramCard>

        {/* Процент побед */}
        <TelegramCard style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '8px'
          }}>
            📈 Процент побед
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700',
            color: calculateWinRate() >= 50 ? '#4CAF50' : '#F44336'
          }}>
            {calculateWinRate()}%
          </div>
          <div style={{ 
            fontSize: '0.85rem', 
            opacity: 0.8,
            marginTop: '4px'
          }}>
            {stats.wins} из {stats.total_matches} матчей
          </div>
        </TelegramCard>

        {stats.last_match_date && (
          <TelegramCard style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '4px'
            }}>
              🗓️ Последний матч
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: 0.8
            }}>
              {new Date(stats.last_match_date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </TelegramCard>
        )}

        <div style={{ marginTop: '20px' }}>
          <TelegramButton to="/profile" variant="secondary">
            Назад в профиль
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}