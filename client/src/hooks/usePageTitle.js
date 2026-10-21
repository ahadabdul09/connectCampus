import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | connectCampus`;
    } else {
      document.title = 'connectCampus | Your Campus, in One Place';
    }
  }, [title]);
}
