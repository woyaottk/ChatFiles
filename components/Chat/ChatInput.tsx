import {Message} from '@/types';
import {IconPlayerStop, IconRepeat, IconSend} from '@tabler/icons-react';
import {
  FC,
  KeyboardEvent,
  MutableRefObject,
  useEffect,
  useState,
} from 'react';
import {useTranslation} from 'next-i18next';
import VoiceInput from './VoiceInput';

interface Props {
  messageIsStreaming: boolean;
  conversationIsEmpty: boolean;
  onSend: (message: Message) => void;
  onRegenerate: () => void;
  stopConversationRef: MutableRefObject<boolean>;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  handleKeyConfigurationValidation: () => boolean;
}

export const ChatInput: FC<Props> = ({
                                       messageIsStreaming,
                                       conversationIsEmpty,
                                       onSend,
                                       onRegenerate,
                                       stopConversationRef,
                                       textareaRef,
                                       handleKeyConfigurationValidation,
                                     }) => {
  const {t} = useTranslation('chat');
  const [content, setContent] = useState<string>();
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const maxLength = 12000;

    if (value.length > maxLength) {
      alert(
        t(
          `Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`,
          {maxLength, valueLength: value.length},
        ),
      );
      return;
    }

    setContent(value);
  };

  const handleSend = () => {
    if (messageIsStreaming) {
      return;
    }

    if (!content) {
      alert(t('Please enter a message'));
      return;
    }

    onSend({role: 'user', content});
    setContent('');

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setContent(transcript);
  };

  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isTyping) {
      if (e.key === 'Enter' && !e.shiftKey && !isMobile()) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`;
    }
  }, [content]);

  function handleStopConversation() {
    stopConversationRef.current = true;
    setTimeout(() => {
      stopConversationRef.current = false;
    }, 1000);
  }

  return (
    <div
      className="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-6 dark:border-white/20 dark:via-[#343541] dark:to-[#343541] md:pt-2">
      <div
        className="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto lg:max-w-3xl animate-fade-in">
        {messageIsStreaming && (
          <button
            className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full border border-red-200 bg-gradient-to-r from-red-50 to-red-100 py-2 px-6 text-red-700 shadow-lg backdrop-blur-sm dark:border-red-800 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-300 md:top-0 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/70 dark:hover:to-red-700/70 transition-all duration-300"
            onClick={handleStopConversation}
          >
            <IconPlayerStop size={16} className="mb-[2px] inline-block mr-1"/>{' '}
            {t('Stop Generating')}
          </button>
        )}

        {!messageIsStreaming && !conversationIsEmpty && (
          <button
            className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 py-2 px-6 text-blue-700 shadow-lg backdrop-blur-sm dark:border-blue-800 dark:from-blue-900/50 dark:to-blue-800/50 dark:text-blue-300 md:top-0 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/70 dark:hover:to-blue-700/70 transition-all duration-300"
            onClick={onRegenerate}
          >
            <IconRepeat size={16} className="mb-[2px] inline-block mr-1"/>{' '}
            {t('Regenerate response')}
          </button>
        )}

        <div
          className="relative flex w-full flex-grow flex-col rounded-2xl border border-gray-200 bg-white py-3 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white md:py-4 md:pl-4">
          <textarea
            ref={textareaRef}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-24 sm:pr-28 pl-2 text-black outline-none focus:ring-0 focus-visible:ring-0 dark:bg-transparent dark:text-white md:pl-0"
            style={{
              resize: 'none',
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: '400px',
              overflow: `${
                textareaRef.current && textareaRef.current.scrollHeight > 400
                  ? 'auto'
                  : 'hidden'
              }`,
            }}
            placeholder={t('Type a message...') || ''}
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <div className="absolute right-2 flex items-center gap-2">
            <VoiceInput 
              onTranscript={handleVoiceTranscript}
              disabled={messageIsStreaming}
            />
            <button
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 active:from-green-600 active:to-green-800 transition-all duration-300 touch-manipulation shadow-lg hover:shadow-xl hover:scale-105 shadow-green-500/30 hover:shadow-green-500/50"
              onClick={handleSend}
            >
              <IconSend size={18} className="sm:w-5 sm:h-5"/>
            </button>
          </div>
        </div>
      </div>
      <div className="px-3 pt-3 pb-4 text-center text-[12px] text-gray-500 dark:text-gray-400 md:px-4 md:pt-4 md:pb-6">
        <a
          href="https://github.com/guangzhengli/ChatFiles"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          ChatFiles
        </a>
        {' '}
        <span className="text-gray-400 dark:text-gray-500">
          {t(
            "aims to establish embeddings for ChatGPT and facilitate its ability to engage in document-based conversations.",
          )}
        </span>
      </div>
    </div>
  );
};
