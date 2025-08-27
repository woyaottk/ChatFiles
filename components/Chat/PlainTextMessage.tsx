import { FC } from 'react';

interface Props {
  content: string;
}

export const PlainTextMessage: FC<Props> = ({ content }) => {
  return (
    <div 
      className="whitespace-pre-wrap break-words"
      style={{ 
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
    >
      {content}
    </div>
  );
};
