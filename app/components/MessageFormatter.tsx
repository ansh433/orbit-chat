import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useAppSelector } from '../store/hooks';

interface MessageFormatterProps {
  content: string;
  className?: string;
}

const MessageFormatter: React.FC<MessageFormatterProps> = ({ content, className = '' }) => {
  const [copiedBlocks, setCopiedBlocks] = useState<Record<number, boolean>>({});
  const theme = useAppSelector((state) => state.theme.theme);

  const copyToClipboard = async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => ({ ...prev, [blockIndex]: true }));
      setTimeout(() => {
        setCopiedBlocks(prev => ({ ...prev, [blockIndex]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : 'prose-slate'} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const inline = !className;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const code = String(children).replace(/\n$/, '');
            const blockIndex = Math.random();

            if (inline) {
              return (
                <code className={`px-2 py-1 rounded text-base font-mono ${
                  theme === 'dark' 
                    ? 'bg-gray-800/60 text-orange-300' 
                    : 'bg-gray-200/80 text-orange-600'
                }`}>
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group my-4">
                <div className={`flex items-center justify-between px-4 py-2 rounded-t-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-800/70 border-white/10'
                    : 'bg-gray-100/80 border-black/10'
                }`}>
                  <span className={`text-xs font-mono ${
                    theme === 'dark' ? 'text-white/60' : 'text-black/60'
                  }`}>{language}</span>
                  <button
                    onClick={() => copyToClipboard(code, blockIndex)}
                    className={`flex items-center gap-1 text-xs transition-colors opacity-0 group-hover:opacity-100 ${
                      theme === 'dark' 
                        ? 'text-white/60 hover:text-white' 
                        : 'text-black/60 hover:text-black'
                    }`}
                  >
                    {copiedBlocks[blockIndex] ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={theme === 'dark' ? dracula : prism}
                  customStyle={{
                    fontSize: '18px',
                    lineHeight: '1.2',
                    margin: 0,
                    borderRadius: '0 0 0.5rem 0.5rem',
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    borderTop: 'none',
                    backgroundColor: theme === 'dark' ? '#0f0f23' : '#fafbfc',
                  }}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            );
          },
          h1: ({ children }) => (
            <h1 className={`text-4xl font-bold mt-6 mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-3xl font-bold mt-6 mb-3 ${
              theme === 'dark' ? 'text-white/95' : 'text-black/95'
            }`}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-2xl font-semibold mt-4 mb-2 ${
              theme === 'dark' ? 'text-white/90' : 'text-black/90'
            }`}>{children}</h3>
          ),
          p: ({ children }) => (
            <p className={`leading-relaxed mb-4 mt-2 text-lg ${
              theme === 'dark' ? 'text-white/85' : 'text-black/85'
            }`}>{children}</p>
          ),
          hr: ({ children }) => (
            <hr className={`my-6 border-0 h-px ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' 
                : 'bg-gradient-to-r from-transparent via-black/20 to-transparent'
            }`} />
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-2">{children}</ol>
          ),
          li: ({ children }: any) => (
            <li className={`flex gap-3 leading-relaxed text-lg ${
              theme === 'dark' ? 'text-white/85' : 'text-black/85'
            }`}>
              <span className={`text-lg min-w-fit pt-0.5 ${
                theme === 'dark' ? 'text-white/60' : 'text-black/60'
              }`}>•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold ${
              theme === 'dark' ? 'text-white/95' : 'text-black/95'
            }`}>{children}</strong>
          ),
          em: ({ children }) => (
            <em className={`italic ${
              theme === 'dark' ? 'text-white/90' : 'text-black/90'
            }`}>{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageFormatter;