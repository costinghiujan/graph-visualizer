import React, { useState } from 'react';
import { theme } from '../styles/theme';
import { ALGORITHM_REGISTRY } from '../algorithms/registry';

interface TopBarProps {
  selectedAlgorithmId: string;
  onSelectAlgorithm: (id: string) => void;
  startNode: string | null;
  isRunning: boolean;
  onStart: () => void;
  onReset: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedAlgorithmId,
  onSelectAlgorithm,
  startNode,
  isRunning,
  onStart,
  onReset,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentAlgo = ALGORITHM_REGISTRY[selectedAlgorithmId];

  return (
    <header style={styles.topBar}>
      <div style={styles.leftGroup}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          style={styles.hamburgerBtn}
          title="Alege algoritm"
        >
          ☰
        </button>

        <div style={styles.algoNameBadge}>
          Algoritm: <strong>{currentAlgo?.name || 'Neselectat'}</strong>
        </div>

        <div style={styles.startBadge}>
          Start: <strong style={{ color: startNode ? theme.colors.nodeStart : theme.colors.textMuted }}>
            {startNode || 'Apasă pe un nod'}
          </strong>
        </div>
      </div>

      {menuOpen && (
        <div style={styles.menuDropdown}>
          <div style={styles.dropdownHeader}>Algoritmi</div>
          {Object.values(ALGORITHM_REGISTRY).map((algo) => (
            <button
              key={algo.id}
              style={{
                ...styles.dropdownItem,
                color: theme.colors.textPrimary,
                backgroundColor: algo.id === selectedAlgorithmId ? theme.colors.border : 'transparent',
              }}
              onClick={() => {
                onSelectAlgorithm(algo.id);
                setMenuOpen(false);
              }}
            >
              {algo.name}
            </button>
          ))}
        </div>
      )}

      <div style={styles.controlsGroup}>
        <button
          onClick={onStart}
          disabled={!startNode || isRunning}
          style={{
            ...styles.actionBtn,
            backgroundColor: theme.colors.accentHover,
            color: '#fff',
            opacity: !startNode || isRunning ? 0.5 : 1,
          }}
        >
          {isRunning ? 'Rulare...' : 'Start'}
        </button>
        <button onClick={onReset} style={styles.resetBtn}>
          Reset
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    position: 'absolute',
    top: '1rem',
    left: '320px',
    right: '1.5rem',
    height: '46px',
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: `${theme.sizes.borderRadius}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    zIndex: 25,
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
  },
  hamburgerBtn: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderFocus}`,
    color: theme.colors.textPrimary,
    borderRadius: '6px',
    padding: '0.35rem 0.65rem',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  algoNameBadge: {
    fontSize: '0.85rem',
    color: theme.colors.textPrimary,
  },
  startBadge: {
    fontSize: '0.8rem',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.bgCard,
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    border: `1px solid ${theme.colors.border}`,
  },
  menuDropdown: {
    position: 'absolute',
    top: '52px',
    left: '0',
    width: '260px',
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderFocus}`,
    borderRadius: `${theme.sizes.borderRadius}px`,
    boxShadow: theme.shadows.drawer,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 50,
  },
  dropdownHeader: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    borderBottom: `1px solid ${theme.colors.border}`,
    textTransform: 'uppercase',
  },
  dropdownItem: {
    border: 'none',
    textAlign: 'left',
    padding: '0.65rem 0.85rem',
    fontSize: '0.85rem',
    width: '100%',
    cursor: 'pointer',
  },
  controlsGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderFocus}`,
    color: theme.colors.textPrimary,
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetBtn: {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.error}`,
    color: theme.colors.error,
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};