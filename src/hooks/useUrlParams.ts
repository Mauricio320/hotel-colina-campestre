import { useEffect } from 'react';

export const useUrlParams = () => {
  const getUrlParam = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  };

  const parseTabParam = (maxIndex: number): number => {
    const tabParam = getUrlParam('tab');
    
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam);
      if (tabIndex >= 0 && tabIndex < maxIndex) {
        return tabIndex;
      }
    }
    
    return 0;
  };

  const scrollToTabView = () => {
    setTimeout(() => {
      const tabViewElement = document.querySelector('.p-tabview-nav');
      if (tabViewElement) {
        tabViewElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  };

  return {
    getUrlParam,
    parseTabParam,
    scrollToTabView,
  };
};