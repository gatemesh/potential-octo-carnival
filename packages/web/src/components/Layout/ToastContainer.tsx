
import { useToastStore, Toast } from '@/store/toastStore';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 max-w-md ${getBackgroundColor()}`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-gray-700 text-sm mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}