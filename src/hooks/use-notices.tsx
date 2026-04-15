import { createContext, useState, useContext, ReactNode } from 'react';

interface NoticeProps {
  type?: 'error' | 'info' | 'success';
  message: string;
}

interface NoticesContextProps {
  notice: NoticeProps | null;
  setNotice: (args: NoticeProps | null) => void;
}

const NoticesContext = createContext<NoticesContextProps>({
  notice: null,
  setNotice: () => {},
});

interface NoticesProviderProps {
  children: ReactNode;
}

export const NoticesProvider = ({ children }: NoticesProviderProps) => {
  const [notice, setNotice] = useState<NoticeProps | null>(null);

  return (
    <NoticesContext.Provider value={{ notice, setNotice }}>
      {children}
    </NoticesContext.Provider>
  );
};

const useNotices = () => {
  return useContext(NoticesContext);
};

export default useNotices;
