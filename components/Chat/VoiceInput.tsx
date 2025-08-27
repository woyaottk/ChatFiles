import React, { useState, useEffect, useRef } from 'react';
import { IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN'; // 设置为中文
      
      // 移动端调试信息
      console.log('语音识别初始化:', {
        userAgent: navigator.userAgent,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        speechRecognition: !!SpeechRecognition
      });
      
      recognition.onstart = () => {
        setIsListening(true);
        setIsPreparing(false);
        setError(null);
      };
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        if (transcript.trim()) {
          onTranscript(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        
        // 移动端特殊错误处理
        if (event.error === 'not-allowed') {
          setError('请允许麦克风权限以使用语音输入');
        } else if (event.error === 'no-speech') {
          setError('未检测到语音，请重试');
        } else if (event.error === 'network') {
          setError('网络连接错误，请检查网络');
        } else if (event.error === 'aborted') {
          // aborted错误通常是正常的，不需要显示错误
          console.log('语音识别被中断（正常行为）');
          setError(null);
        } else {
          setError(`语音识别错误: ${event.error}`);
        }
        
        setIsListening(false);
        setIsPreparing(false);
      };
      
      recognition.onend = () => {
        console.log('语音识别结束');
        // 只有在没有主动停止的情况下才重置状态
        if (!isStoppingRef.current) {
          setIsListening(false);
          setIsPreparing(false);
        }
      };
    } else {
      setIsSupported(false);
      setError('您的浏览器不支持语音识别功能');
    }
    
    return () => {
      // 清理所有定时器
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
      
      // 重置所有状态
      setIsPressed(false);
      setIsPreparing(false);
      setIsListening(false);
      setError(null);
      
      // 停止语音识别
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('清理时停止语音识别出错（正常）:', error);
        }
      }
    };
  }, [onTranscript]);

  const startListening = async () => {
    if (!isSupported || disabled) return;
    
    try {
      // 移动端权限检查
      if (isMobile()) {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) {
          return;
        }
      }
      
      // 确保语音识别实例存在且未在运行
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('启动语音识别失败:', err);
      setError('启动语音识别失败');
      setIsListening(false);
      setIsPreparing(false);
    }
  };

  // 检查是否为移动端
  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  // 检查麦克风权限
  const checkMicrophonePermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
    } catch (error) {
      console.error('麦克风权限检查失败:', error);
      setError('请允许麦克风权限以使用语音输入');
      return false;
    }
    return false;
  };

  const stopListening = () => {
    if (isListening || isPreparing) {
      isStoppingRef.current = true;
      
      try {
        // 先尝试停止，如果失败则忽略
        recognitionRef.current?.stop();
      } catch (error) {
        console.log('停止语音识别时出现错误（正常）:', error);
      }
      
      // 立即重置状态，不等待语音识别完全停止
      setIsListening(false);
      setIsPreparing(false);
      
      // 重置停止标志
      setTimeout(() => {
        isStoppingRef.current = false;
      }, 100);
    }
  };

  const handleMouseDown = () => {
    if (!isSupported || disabled) return;
    
    console.log('按钮按下 - 移动端调试');
    setIsPressed(true);
    // 长按150ms后显示准备状态
    pressTimerRef.current = setTimeout(() => {
      console.log('准备录音状态');
      setIsPreparing(true);
      // 再等50ms后开始录音
      setTimeout(() => {
        console.log('开始录音');
        startListening();
      }, 50);
    }, 150);
  };

  const handleMouseUp = () => {
    if (!isSupported || disabled) return;
    
    console.log('按钮松开 - 移动端调试');
    setIsPressed(false);
    // 立即停止所有状态
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    stopListening();
  };

  const handleMouseLeave = () => {
    if (!isSupported || disabled) return;
    
    setIsPressed(false);
    // 立即停止所有状态
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    stopListening();
  };

  // 触摸事件处理 - 移动端单击模式
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('触摸开始 - 移动端调试');
    setIsPressed(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('触摸结束 - 移动端调试');
    setIsPressed(false);
    
    // 移动端单击切换录音状态
    if (isListening) {
      console.log('移动端停止录音');
      stopListening();
    } else {
      console.log('移动端开始录音');
      startListening();
    }
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('触摸取消 - 移动端调试');
    setIsPressed(false);
    setIsPreparing(false);
    stopListening();
  };

  if (!isSupported) {
    return (
      <button
        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 cursor-not-allowed shadow-sm border border-gray-200 dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:text-gray-500"
        disabled
        title="浏览器不支持语音识别"
      >
        <IconMicrophone size={20} className="sm:w-6 sm:h-6" />
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-150 touch-manipulation select-none shadow-lg hover:shadow-xl ${
          isListening
            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white scale-110 shadow-orange-500/50 animate-pulse recording-glow'
            : isPreparing
            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white scale-105 shadow-orange-500/50'
            : isPressed
            ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white scale-105 shadow-blue-500/50'
            : disabled
            ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 cursor-not-allowed shadow-sm border border-gray-200 dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:text-gray-500'
            : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 active:from-blue-600 active:to-blue-800 hover:scale-105 shadow-blue-500/30 hover:shadow-blue-500/50 voice-button-glow'
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
        disabled={disabled}
        title={isListening ? '点击停止录音' : '点击开始录音'}
      >
        {isListening ? (
          <div className="relative">
            <IconMicrophone size={20} className="sm:w-6 sm:h-6 animate-bounce" />
            <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></div>
          </div>
        ) : (
          <IconMicrophone size={20} className="sm:w-6 sm:h-6" />
        )}
      </button>
      
      {/* 录音波纹效果 */}
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20"></div>
      )}
      
              {error && (
          <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 glass-effect bg-red-50/80 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap z-20 max-w-[200px] sm:max-w-none shadow-lg animate-slide-up">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </div>
          </div>
        )}
        
        {isPreparing && (
          <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 glass-effect bg-orange-50/80 border border-orange-200 text-orange-700 px-3 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap z-20 shadow-lg animate-slide-up">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              准备录音...
            </div>
          </div>
        )}
        

        
        {isListening && (
          <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 glass-effect bg-blue-50/80 border border-blue-200 text-blue-700 px-3 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap z-20 shadow-lg animate-slide-up">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              正在录音...
            </div>
          </div>
        )}
    </div>
  );
};

export default VoiceInput;
