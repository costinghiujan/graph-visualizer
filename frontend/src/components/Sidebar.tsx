import React, { useRef } from 'react';

interface SidebarProps {
  inputText: string;
  onTextChange: (text: string) => void;
  activeNodesCount: number;
  activeEdgesCount: number;
}

const MAX_LABEL_LENGTH = 3;

// Verifică formatul unui singur nod
export const isValidNodeLabel = (label: string): boolean => {
  return label.length > 0 && label.length <= MAX_LABEL_LENGTH && !/\s/.test(label);
};

export interface ParsedGraphData {
  nodes: string[];
  edges: Array<{ source: string; target: string; id: string }>;
}

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

    // Cazul 1: Linie cu un singur nod (fără spații interioare)
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

    // Cazul 2: Linie cu muchie (U V)
    const tokens = trimmed.split(' ');
    if (tokens.length !== 2) {
      return { isError: true, message: 'Format invalid: folosește exact 2 noduri despărțite printr-un singur spațiu' };
    }

    const [u, v] = tokens;
    if (!isValidNodeLabel(u) || !isValidNodeLabel(v)) {
      return { isError: true, message: `Fiecare nod din muchie trebuie să aibă între 1 și ${MAX_LABEL_LENGTH} caractere` };
    }

    if (u === v) {
      return { isError: true, message: `Auto-muchiile (de la nod la el însuși) nu sunt permise` };
    }

    // Cheie unică pentru muchie neorientată
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
    <aside style={styles.sidebar}>
      <h2 style={styles.title}>Definire Graf</h2>
      <p style={styles.desc}>
        Scrie noduri individuale (ex: <code>A</code>) sau muchii (ex: <code>A B</code>). Nodurile noi sunt create automat.
      </p>

      {/* Editor cu Gutter lateral */}
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
          placeholder={"2\n3\n2 3\n12 43\na 444"}
          value={inputText}
          onChange={(e) => onTextChange(e.target.value)}
          onScroll={handleScroll}
          rows={12}
          spellCheck={false}
        />
      </div>

      <div style={styles.card}>
        <div>Noduri active: <strong style={{ color: '#38bdf8' }}>{activeNodesCount}</strong></div>
        <div style={{ marginTop: '0.25rem' }}>
          Muchii active: <strong style={{ color: '#818cf8' }}>{activeEdgesCount}</strong>
        </div>
      </div>
    </aside>
  );
};

const LINE_HEIGHT = 24;

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '280px',
    borderRight: '1px solid #1f2937',
    backgroundColor: '#0b0f19',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#f8fafc',
  },
  desc: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#9ca3af',
    lineHeight: 1.4,
  },
  editorContainer: {
    flex: 1,
    display: 'flex',
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  gutter: {
    width: '32px',
    backgroundColor: '#0b0f19',
    borderRight: '1px solid #1f2937',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    userSelect: 'none',
  },
  gutterLine: {
    height: `${LINE_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  },
  lineIndex: {
    color: '#4b5563',
  },
  errorIcon: {
    color: '#ef4444',
    fontWeight: 900,
    fontSize: '0.75rem',
    cursor: 'help',
  },
  textarea: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#f8fafc',
    padding: '0.75rem 0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    lineHeight: `${LINE_HEIGHT}px`,
    outline: 'none',
    resize: 'none',
    whiteSpace: 'pre',
    overflowY: 'auto',
  },
  card: {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
  },
};