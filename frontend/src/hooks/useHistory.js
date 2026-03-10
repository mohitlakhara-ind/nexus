import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export default function useHistory() {
  const historyStack = useRef([]);
  const redoStack = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushSnapshot = useCallback((nodes, edges) => {
    historyStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now()
    });

    // Keep history size bounded
    if (historyStack.current.length > MAX_HISTORY) {
      historyStack.current.shift();
    }

    // Clear redo stack on new action
    redoStack.current = [];
    setCanUndo(historyStack.current.length > 1);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (historyStack.current.length <= 1) return null;

    const current = historyStack.current.pop();
    redoStack.current.push(current);

    const previous = historyStack.current[historyStack.current.length - 1];
    setCanUndo(historyStack.current.length > 1);
    setCanRedo(true);

    return previous;
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return null;

    const next = redoStack.current.pop();
    historyStack.current.push(next);
    
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);

    return next;
  }, []);

  const getHistory = useCallback(() => {
    return historyStack.current.map((snap, i) => ({
      index: i,
      timestamp: snap.timestamp,
      nodeCount: snap.nodes.length,
      edgeCount: snap.edges.length
    }));
  }, []);

  const restoreSnapshot = useCallback((index) => {
    if (index < 0 || index >= historyStack.current.length) return null;
    
    // Push current state to redo
    const currentTop = historyStack.current[historyStack.current.length - 1];
    if (currentTop) redoStack.current.push(currentTop);

    // Trim history to selected index (inclusive)
    historyStack.current = historyStack.current.slice(0, index + 1);
    
    setCanUndo(historyStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);

    return historyStack.current[index];
  }, []);

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistory,
    restoreSnapshot
  };
}
