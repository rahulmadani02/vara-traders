import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toastState, setToastState] = useState({ message: '', isError: false, show: false });
  const timerRef = useRef(null);

  const showToast = useCallback((message, isError = false) => {
    clearTimeout(timerRef.current);
    setToastState({ message, isError, show: true });
    timerRef.current = setTimeout(() => {
      setToastState((s) => ({ ...s, show: false }));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        id="toast"
        className={toastState.show ? 'show' : ''}
        style={{ background: toastState.isError ? '#A8342A' : '#1F2E22' }}
      >
        {toastState.message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
