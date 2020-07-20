import { useEffect, useState } from 'react';

export default function useObjectUrl(content) {
  const [url, setUrl] = useState('data:text/plain,');
  useEffect(() => {
    /**
     * By prepending '\ufeff' to the content, the text will be displayed with the proper charset.
     * @see { @link https://stackoverflow.com/a/17879474/1798341 }
     */
    const blob = new Blob(['\ufeff', content], { type: 'text/plain;charset=utf-8' });
    const dataUrl = URL.createObjectURL(blob);
    setUrl(dataUrl);

    return () => {
      URL.revokeObjectURL(dataUrl);
    };
  }, [content]);

  return url;
}
