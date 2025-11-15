"use client";

import {useMemo, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Box, Typography, CircularProgress} from '@mui/material';
import {alpha} from '@mui/material/styles';
import {
  Bell,
  MessageCircle,
  Coffee,
  CalendarDays,
  Star,
  CheckSquare,
  ChevronRight,
  Settings,
  Images,
  Notebook,
  Users,
  Gamepad2,
  DollarSign,
} from 'lucide-react';

import {Group} from '@/lib/types/group';
import {useGroupContext} from '@/contexts/GroupContext';
import {useGroup} from '@/hooks/use-group';


const MENU_ITEMS = [
  {key: 'news', label: 'NOWOŚCI', icon: Bell},
  {key: 'chat', label: 'CZAT', icon: MessageCircle},
  {key: 'events', label: 'WYDARZENIA', icon: Coffee},
  {key: 'calendar', label: 'KALENDARZ', icon: CalendarDays},
  {key: 'settlements', label: 'ROZLICZENIA', icon: DollarSign},
  {key: 'recommendations', label: 'REKOMENDACJE', icon: Star},
  {key: 'tasks', label: 'ZADANIA', icon: CheckSquare},
  {key: 'albums', label: 'ALBUM', icon: Images},
  {key: 'games', label: 'GRY', icon: Gamepad2},
  {key: 'study', label: 'NAUKA', icon: Notebook},
  {key: 'members', label: 'CZŁONKOWIE', icon: Users},
  {key: 'settings', label: 'OPCJE GRUPY', icon: Settings},
] as const;

export default function GroupMenuPage() {
  const router = useRouter();
  const { currentGroup, setCurrentGroup } = useGroupContext();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId') || '';
  const { getGroupById, loading, error } = useGroup();

  useEffect(() => {
    const fetchGroup = async () => {
      if (groupId) {
        const fetchedGroup = await getGroupById(groupId);
        if (fetchedGroup) {
          setCurrentGroup(fetchedGroup);
        }
      }
    };

    fetchGroup();
  }, [groupId]);
 
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        px: {xs: 2, sm: 4},
        py: {xs: 3, sm: 6},
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          

          <Typography
            variant="h2"
            sx={{
              flex: 1,
              textAlign: 'center',
              color: 'text.primary',
              mb: 2,
            }}
          >
            {currentGroup?.name || 'Twoja grupa'}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 6,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography
              sx={{
                color: 'error.main',
                fontSize: '20px',
                textAlign: 'center',
                mt: 6,
              }}
            >
              {error}
            </Typography>
          ) : currentGroup ? (
            MENU_ITEMS.map((item) => {
              const ItemIcon = item.icon;
              return (
                <Box
                  key={item.key}
                  role="button"
                  tabIndex={0}
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: 2.5,
                    py: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.2),
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, background 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      bgcolor: alpha(theme.palette.grey[500], 0.4),
                    }
                  })}
                  onClick={() => {
                    console.debug(`Moduł: ${item.label}`);
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    
                      }}
                    >
                      <ItemIcon size={30} strokeWidth={1.6} />
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        letterSpacing: 1.5,
                        fontSize: '16px',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                  <ChevronRight size={25} strokeWidth={1.6} />
                </Box>
              );
            })
          ) : (
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: '20px',
                textAlign: 'center',
                mt: 6,
              }}
            >
             Nieznany kontekst grupy!
             <br />
             Wybierz grupę ze swojej listy, aby zobaczyć menu.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}