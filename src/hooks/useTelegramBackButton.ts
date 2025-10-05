import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showBackButton, hideBackButton, onBackButtonClick } from '@telegram-apps/sdk-react';

export const useTelegramBackButton = (onBack?: () => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = () => {
      if (onBack) {
        onBack();
      } else {
        navigate('/');
      }
    };

    showBackButton();
    const cleanup = onBackButtonClick(handleClick);

    return () => {
      cleanup();
      hideBackButton();
    };
  }, [navigate, onBack]);
};
