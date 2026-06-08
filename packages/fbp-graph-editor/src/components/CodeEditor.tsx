import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { clsx } from 'clsx';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = 'graphql',
  placeholder = '',
  className 
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync scroll between textarea and highlighted code
  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const pre = textarea?.parentElement?.querySelector('pre');
    if (textarea && pre) {
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    }
  }, []);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }, [value, onChange]);

  return (
    <div 
      className={clsx(
        'relative rounded bg-slate-800 border overflow-hidden',
        isFocused ? 'border-blue-500' : 'border-slate-600',
        className
      )}
    >
      <Highlight
        theme={themes.nightOwl}
        code={value || placeholder}
        language={language as any}
      >
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={clsx(
              highlightClassName,
              'absolute inset-0 p-2 m-0 overflow-auto pointer-events-none',
              'text-sm font-mono leading-relaxed whitespace-pre-wrap break-words'
            )}
            style={{ 
              ...style, 
              background: 'transparent',
              minHeight: '120px'
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span 
                    key={key} 
                    {...getTokenProps({ token })}
                    style={{
                      ...getTokenProps({ token }).style,
                      opacity: !value && placeholder ? 0.5 : 1
                    }}
                  />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        className={clsx(
          'relative w-full p-2 m-0 bg-transparent resize-none',
          'text-sm font-mono leading-relaxed whitespace-pre-wrap break-words',
          'text-transparent caret-white',
          'focus:outline-none',
          'min-h-[120px]'
        )}
        style={{
          WebkitTextFillColor: 'transparent'
        }}
      />
    </div>
  );
}
