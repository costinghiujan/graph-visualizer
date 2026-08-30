import React, { useRef } from 'react';
import { theme } from '../styles/theme';

interface SidebarProps {
  inputText: string;
  onTextChange: (text: string) => void;
  activeNodesCount: number;
  activeEdgesCount: number;
  isOpen: boolean;
  onClose?: () => void;
}

const MAX_LABEL_LENGTH = 3;

export const isValidNodeLabel = (label: string): boolean => {
  return label.length > 0 && label.length <= MAX_LABEL_LENGTH && !/\s/.test(label);
};

export const parseGraphInput = (text: string) => {
  const lines = text.split('\n');
  const uniqueNodes = new Set<string>();
  const explicitNodes = new Set<string>();
  const parsedEdges: Array<{ source: string; target: string; id: string }> = [];
  const seenEdges = new Set<string>();

  const lineStatuses = lines.map((rawLine) => {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) {
      return { isError: false, message: '' };
    }

    if (!trimmed.includes(' ')) {
      if (!isValidNodeLabel(trimmed)) {
        return { isError: true, message: `Nod invalid: "${trimmed}" depășește ${MAX_LABEL_LENGTH} caractere` };
      }
      if (explicitNodes.has(trimmed)) {
        return { isError: true, message: `Nod duplicat: "${trimmed}" a fost deja definit` };
      }
      explicitNodes.add(trimmed);
      uniqueNodes.add(trimmed);
      return { isError: false, message: '' };
    }

    const tokens = trimmed.split(' ');
    if (tokens.length !== 2) {
      return { isError: true, message: 'Format invalid: folosește exact 2 noduri despărțite printr-un singur spațiu' };
    }

    const [u, v] = tokens;
    if (!isValidNodeLabel(u) || !isValidNodeLabel(v)) {
      return { isError: true, message: `Fiecare nod trebuie să aibă între 1 și ${MAX_LABEL_LENGTH} caractere` };
    }

    if (u === v) {
      return { isError: true, message: 'Auto-muchiile nu sunt permise' };
    }

    const edgeKey = [u, v].sort().join('--');
    if (seenEdges.has(edgeKey)) {
      return { isError: true, message: `Muchie duplicată între "${u}" și "${v}"` };
    }

    seenEdges.add(edgeKey);
    uniqueNodes.add(u);
    uniqueNodes.add(v);
    parsedEdges.push({ source: u, target: v, id: `e-${u}-${v}` });

    return { isError: false, message: '' };
  });

  return {
    nodes: Array.from(uniqueNodes),
    edges: parsedEdges,
    lineStatuses,
  };
};

export const Sidebar: React.FC<SidebarProps> = ({
  inputText,
  onTextChange,
  activeNodesCount,
  activeEdgesCount,
  isOpen,
  onClose,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const { lineStatuses } = parseGraphInput(inputText);

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <aside
      style={{
        ...styles.sidebar,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Definire Graf</h2>
          <p style={styles.desc}>
            Scrie noduri (ex: <code>A</code>) sau muchii (ex: <code>A B</code>).
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} style={styles.closeBtn} aria-label="Închide meniul">
            ✕
          </button>
        )}
      </div>

      <div style={styles.editorContainer}>
        <div ref={gutterRef} style={styles.gutter}>
          {lineStatuses.map((status, index) => (
            <div key={index} style={styles.gutterLine}>
              {status.isError ? (
                <span title={status.message} style={styles.errorIcon}>
                  ✕
                </span>
              ) : (
                <span style={styles.lineIndex}>{index + 1}</span>
              )}
            </div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          style={styles.textarea}
          placeholder={"2\n3\n2 3\n12 43"}
          value={inputText}
          onChange={(e) => onTextChange(e.target.value)}
          onScroll={handleScroll}
          rows={12}
          spellCheck={false}
        />
      </div>

      <div style={styles.card}>
        <div>Noduri active: <strong style={{ color: theme.colors.accent }}>{activeNodesCount}</strong></div>
        <div style={{ marginTop: '0.25rem' }}>
          Muchii active: <strong style={{ color: '#818cf8' }}>{activeEdgesCount}</strong>
        </div>
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: `${theme.sizes.sidebarWidth}px`,
    maxWidth: '85vw',
    height: '100%',
    borderRight: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.bgSidebar,
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    zIndex: 30,
    position: 'relative',
    transition: 'transform 0.25s ease-in-out',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: theme.colors.textPrimary,
  },
  desc: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.8rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.4,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: theme.colors.textSecondary,
    fontSize: '1.1rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  editorContainer: {
    flex: 1,
    display: 'flex',
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderFocus}`,
    borderRadius: `${theme.sizes.borderRadius}px`,
    overflow: 'hidden',
  },
  gutter: {
    width: '32px',
    backgroundColor: theme.colors.bgSidebar,
    borderRight: `1px solid ${theme.colors.border}`,
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    userSelect: 'none',
  },
  gutterLine: {
    height: `${theme.typography.lineHeightEditor}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  },
  lineIndex: {
    color: theme.colors.textMuted,
  },
  errorIcon: {
    color: theme.colors.error,
    fontWeight: 900,
    fontSize: '0.75rem',
    cursor: 'help',
  },
  textarea: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.textPrimary,
    padding: '0.75rem 0.5rem',
    fontFamily: theme.typography.codeFont,
    fontSize: '0.9rem',
    lineHeight: `${theme.typography.lineHeightEditor}px`,
    outline: 'none',
    resize: 'none',
    overflowY: 'auto',
    overflowX: 'hidden', // Previne apariția barei orizontale
    scrollbarWidth: 'thin', // Pentru Firefox
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    padding: '0.75rem',
    borderRadius: `${theme.sizes.borderRadius}px`,
    fontSize: '0.8rem',
    boxShadow: theme.shadows.card,
  },
};