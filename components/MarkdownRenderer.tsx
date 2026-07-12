'use client';

import React, { useState } from 'react';
import { Info, AlertTriangle, Lightbulb, HelpCircle, BookOpen, ChevronRight, ChevronDown } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onWikilinkClick?: (target: string) => void;
}

export default function MarkdownRenderer({ content, onWikilinkClick }: MarkdownRendererProps) {
  // Parsing helper for inline styles: bold (**), italic (*), code (`), and Wikilinks ([[Target]] or [[Target|Label]])
  const parseInline = (text: string): React.ReactNode[] => {
    // We match wikilinks first, then bold, italic, code
    const regex = /(\[\[.*?\]\]|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      // 1. Handle Obsidian Wikilinks: [[Target]] or [[Target|Label]]
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const inner = part.slice(2, -2);
        const [target, label] = inner.split('|');
        const displayLabel = label ? label.trim() : target.trim();
        return (
          <button
            key={index}
            onClick={() => onWikilinkClick?.(target.trim())}
            className="cursor-pointer font-bold border-b border-dashed text-accent-gold border-accent-gold/60 hover:text-amber-800 hover:border-amber-800 transition-colors inline-block px-1 rounded hover:bg-amber-500/5 align-baseline"
          >
            {displayLabel}
          </button>
        );
      }

      // 2. Handle Bold: **bold**
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
      }

      // 3. Handle Italic: *italic*
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-stone-700">{part.slice(1, -1)}</em>;
      }

      // 4. Handle Code: `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-stone-100 text-amber-800 px-1.5 py-0.5 rounded text-xs font-mono font-semibold">
            {part.slice(1, -1)}
          </code>
        );
      }

      // 5. Default text
      return part;
    });
  };

  // State-based blockquote parser to identify Obsidian callouts
  const parseBlocks = () => {
    const lines = content.split('\n');
    const blocks: React.ReactNode[] = [];
    
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        i++;
        continue;
      }

      // 1. Handle horizontal rules
      if (trimmed === '---') {
        blocks.push(<hr key={`hr-${i}`} className="my-6 border-t border-stone-200" />);
        i++;
        continue;
      }

      // 2. Handle Headings
      if (trimmed.startsWith('# ')) {
        blocks.push(
          <h1 key={`h1-${i}`} className="mystic-title text-2xl md:text-3xl font-bold mt-8 mb-4 border-b border-stone-200 pb-2">
            {parseInline(trimmed.slice(2))}
          </h1>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        blocks.push(
          <h2 key={`h2-${i}`} className="text-xl md:text-2xl font-serif font-bold text-stone-850 mt-6 mb-3 border-b border-stone-100 pb-1">
            {parseInline(trimmed.slice(3))}
          </h2>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        blocks.push(
          <h3 key={`h3-${i}`} className="text-lg font-bold text-accent-gold mt-5 mb-2">
            {parseInline(trimmed.slice(4))}
          </h3>
        );
        i++;
        continue;
      }
      if (trimmed.startsWith('#### ')) {
        blocks.push(
          <h4 key={`h4-${i}`} className="text-md font-bold text-stone-850 mt-4 mb-2">
            {parseInline(trimmed.slice(5))}
          </h4>
        );
        i++;
        continue;
      }

      // 3. Handle Tables
      if (trimmed.startsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        blocks.push(renderTable(tableLines, i));
        continue;
      }

      // 4. Handle Lists (both ordered and unordered)
      // Check for bullet (- or *) or ordered list (1. 2. etc.)
      const isListItem = /^\s*([*+-]|\d+\.)\s/.test(line);
      if (isListItem) {
        const listLines: string[] = [];
        while (i < lines.length && (/^\s*([*+-]|\d+\.)\s/.test(lines[i]) || (lines[i].startsWith('   ') && lines[i].trim()))) {
          listLines.push(lines[i]);
          i++;
        }
        blocks.push(renderList(listLines, i));
        continue;
      }

      // 5. Handle Blockquotes and Obsidian Callouts
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('>') || (quoteLines.length > 0 && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('|')))) {
          // Clean the leading '>' from each line
          const cleanLine = lines[i].trim().startsWith('>') 
            ? lines[i].trim().slice(1).trim() 
            : lines[i].trim();
          quoteLines.push(cleanLine);
          i++;
        }
        blocks.push(renderQuoteOrCallout(quoteLines, i));
        continue;
      }

      // 6. Default paragraph
      blocks.push(
        <p key={`p-${i}`} className="text-stone-650 text-sm leading-relaxed mb-4">
          {parseInline(trimmed)}
        </p>
      );
      i++;
    }

    return blocks;
  };

  // Renders markdown tables
  const renderTable = (tableLines: string[], keyIndex: number) => {
    const parsedRows = tableLines.map(line => {
      return line
        .split('|')
        .map(cell => cell.trim())
        // Remove empty first and last elements since row starts/ends with |
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    });

    const headers = parsedRows[0] || [];
    // Skip separator line (e.g. |---|---|)
    const dataRows = parsedRows.slice(2);

    return (
      <div key={`table-${keyIndex}`} className="overflow-x-auto my-6 border border-stone-200 rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-xs font-bold text-stone-600 uppercase tracking-wider border-b border-stone-200">
                  {parseInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-100">
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/30'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2.5 text-stone-700 text-xs md:text-sm">
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Renders nested lists
  const renderList = (listLines: string[], keyIndex: number) => {
    const listItems = listLines.map((line) => {
      const leadingSpaces = line.length - line.trimStart().length;
      const trimmed = line.trim();
      const isOrdered = /^\d+\.\s/.test(trimmed);
      const isUnordered = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('+ ');
      
      let text = trimmed;
      if (isOrdered) {
        text = trimmed.replace(/^\d+\.\s/, '');
      } else if (isUnordered) {
        text = trimmed.slice(2);
      }

      return {
        text,
        indent: leadingSpaces,
        isOrdered,
      };
    });

    const isListOrdered = listItems[0]?.isOrdered || false;

    if (isListOrdered) {
      return (
        <ol key={`ol-${keyIndex}`} className="list-decimal pl-6 my-4 space-y-2 text-stone-700 text-xs md:text-sm">
          {listItems.map((item, idx) => (
            <li 
              key={idx} 
              className={`${item.indent > 0 ? 'ml-4 list-none pl-3 border-l border-stone-200 text-stone-600' : ''}`}
            >
              {parseInline(item.text)}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <ul key={`ul-${keyIndex}`} className="list-disc pl-6 my-4 space-y-2 text-stone-700 text-xs md:text-sm">
        {listItems.map((item, idx) => (
          <li 
            key={idx} 
            className={`marker:text-accent-gold ${item.indent > 0 ? 'ml-4 list-none pl-3 border-l border-stone-200 text-stone-600' : ''}`}
          >
            {parseInline(item.text)}
          </li>
        ))}
      </ul>
    );
  };

  // Renders blockquotes OR Obsidian callouts
  const renderQuoteOrCallout = (quoteLines: string[], keyIndex: number) => {
    const firstLine = quoteLines[0] || '';
    
    // Check if it matches Obsidian callout syntax: [!type] Title or [!type]- Title
    const calloutMatch = firstLine.match(/^\[!([a-zA-Z]+)\](-|\+)?(.*)/);
    
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const isCollapsible = !!calloutMatch[2];
      const isDefaultClosed = calloutMatch[2] === '-';
      const titleText = calloutMatch[3].trim() || type.toUpperCase();
      
      const contentLines = quoteLines.slice(1);

      // Determine styles based on callout type
      let config = {
        bg: 'bg-stone-50 border-stone-300 text-stone-800',
        titleColor: 'text-stone-900',
        icon: <Info className="w-4 h-4 text-stone-500" />,
        borderLeft: 'border-l-4 border-stone-500',
      };

      if (type === 'info' || type === 'note') {
        config = {
          bg: 'bg-sky-50/50 border-sky-100 text-sky-850',
          titleColor: 'text-sky-900',
          icon: <Info className="w-4.5 h-4.5 text-sky-600" />,
          borderLeft: 'border-l-4 border-sky-500',
        };
      } else if (type === 'warning' || type === 'caution' || type === 'danger') {
        config = {
          bg: 'bg-rose-50/50 border-rose-100 text-rose-850',
          titleColor: 'text-rose-900',
          icon: <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />,
          borderLeft: 'border-l-4 border-rose-500',
        };
      } else if (type === 'tip' || type === 'hint' || type === 'success') {
        config = {
          bg: 'bg-emerald-50/50 border-emerald-100 text-emerald-850',
          titleColor: 'text-emerald-900',
          icon: <Lightbulb className="w-4.5 h-4.5 text-emerald-600" />,
          borderLeft: 'border-l-4 border-emerald-500',
        };
      } else if (type === 'example' || type === 'quote') {
        config = {
          bg: 'bg-purple-50/50 border-purple-100 text-purple-850',
          titleColor: 'text-purple-900',
          icon: <BookOpen className="w-4.5 h-4.5 text-purple-600" />,
          borderLeft: 'border-l-4 border-purple-500',
        };
      } else if (type === 'faq' || type === 'question') {
        config = {
          bg: 'bg-amber-50/50 border-amber-100 text-amber-850',
          titleColor: 'text-amber-900',
          icon: <HelpCircle className="w-4.5 h-4.5 text-amber-600" />,
          borderLeft: 'border-l-4 border-accent-gold',
        };
      }

      if (isCollapsible) {
        return (
          <CollapsibleCallout 
            key={`callout-collapse-${keyIndex}`}
            config={config}
            title={titleText}
            defaultClosed={isDefaultClosed}
          >
            {contentLines.map((line, idx) => (
              <p key={idx} className="text-xs md:text-sm leading-relaxed mb-2 last:mb-0">
                {parseInline(line)}
              </p>
            ))}
          </CollapsibleCallout>
        );
      }

      return (
        <div key={`callout-${keyIndex}`} className={`p-4 rounded-r-xl border border-y-stone-200/50 border-r-stone-200/50 my-4 shadow-sm flex flex-col gap-2 ${config.bg} ${config.borderLeft}`}>
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            {config.icon}
            <span className={config.titleColor}>{titleText}</span>
          </div>
          <div className="space-y-2 text-stone-750">
            {contentLines.map((line, idx) => (
              <p key={idx} className="text-xs md:text-sm leading-relaxed last:mb-0">
                {parseInline(line)}
              </p>
            ))}
          </div>
        </div>
      );
    }

    // Default regular blockquote
    return (
      <blockquote key={`quote-${keyIndex}`} className="pl-4 border-l-4 border-accent-gold my-4 italic text-stone-650 bg-stone-50/50 py-2.5 pr-2.5 rounded-r-xl">
        {quoteLines.map((line, idx) => (
          <p key={idx} className="text-xs md:text-sm leading-relaxed mb-2 last:mb-0">
            {parseInline(line)}
          </p>
        ))}
      </blockquote>
    );
  };

  return <div className="space-y-1 font-sans">{parseBlocks()}</div>;
}

// Sub-component to handle interactive collapsible callouts
interface CollapsibleCalloutProps {
  config: {
    bg: string;
    titleColor: string;
    icon: React.ReactNode;
    borderLeft: string;
  };
  title: string;
  defaultClosed: boolean;
  children: React.ReactNode;
}

function CollapsibleCallout({ config, title, defaultClosed, children }: CollapsibleCalloutProps) {
  const [isOpen, setIsOpen] = useState(!defaultClosed);

  return (
    <div className={`rounded-xl border border-stone-200/50 my-4 overflow-hidden shadow-sm flex flex-col ${config.bg} ${config.borderLeft}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left font-bold text-xs md:text-sm transition-colors hover:bg-stone-500/5"
      >
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={config.titleColor}>{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-stone-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-stone-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 pt-1 text-stone-750 border-t border-stone-100/50 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
