import React, { useState, useCallback, Fragment, useEffect } from 'react';
import { GraphNode, GraphEdge } from '@/types';
import GraphNodeComponent from './graph/GraphNode';
import GraphEdgeComponent from './graph/GraphEdge';
import GraphTooltip from './graph/GraphTooltip';
import GraphFilterBar, { GraphFilter } from './graph/GraphFilterBar';
import GraphLegend from './graph/GraphLegend';
import ZoomControls from './graph/ZoomControls';
import { motion, AnimatePresence } from 'motion/react';
import { Undo2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function GraphCanvas({ nodes: initialNodes, edges }: GraphCanvasProps) {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [history, setHistory] = useState<GraphNode[][]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filter, setFilter] = useState<GraphFilter>('all');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isZenPanning, setIsZenPanning] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      setNodes(history[0]);
      setHistory(prev => prev.slice(1));
    }
  }, [history]);

  const confirmReset = useCallback(() => {
    setHistory(h => [nodes, ...h].slice(0, 5));
    setNodes(initialNodes);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setFilter('all');
    setIsResetConfirmOpen(false);
  }, [nodes, initialNodes]);

  useEffect(() => {
    const handleUndoKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    const handleResetEvent = () => confirmReset();

    window.addEventListener('keydown', handleUndoKey);
    window.addEventListener('sentinel-reset-graph', handleResetEvent);

    return () => {
      window.removeEventListener('keydown', handleUndoKey);
      window.removeEventListener('sentinel-reset-graph', handleResetEvent);
    };
  }, [handleUndo, confirmReset]);

  // Zoom logic
  const zoomToPoint = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setScale(prevScale => {
      const newScale = Math.min(Math.max(prevScale * delta, 0.4), 3);

      if (centerX !== undefined && centerY !== undefined) {
        setOffset(prevOffset => ({
          x: centerX - ((centerX - prevOffset.x) / prevScale) * newScale,
          y: centerY - ((centerY - prevOffset.y) / prevScale) * newScale
        }));
      }
      return newScale;
    });
  }, []);

  const handleZoomIn = () => zoomToPoint(1.15);
  const handleZoomOut = () => zoomToPoint(0.85);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = e.currentTarget.getBoundingClientRect();
    zoomToPoint(delta, e.clientX - rect.left, e.clientY - rect.top);
  };

  // Panning logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !hoveredNodeId) {
      setIsPanning(true);
      if (isZenPanning) setIsZenPanning(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning || isZenPanning) {
      setOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!hoveredNodeId) {
      setIsZenPanning(!isZenPanning);
      setIsPanning(false);
    }
  };

  const handleReset = useCallback(() => {
    setIsResetConfirmOpen(true);
  }, []);

  const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
    if (isZenPanning) return; // Prevent node dragging while in Zen Pan to avoid confusion
    setNodes(prev => {
      return prev.map(n => n.id === id ? { ...n, x, y } : n);
    });
  }, [isZenPanning]);

  const hoveredNode = nodes.find(n => n.id === hoveredNodeId);
  const atRiskNode = nodes.find(n => n.status === 'at-risk');

  // Filter logic
  const isNodeDimmed = (node: GraphNode) => {
    if (filter === 'all') return hoveredNodeId ? hoveredNodeId !== node.id : false;
    if (filter === 'at-risk') return node.status !== 'at-risk' && !edges.some(e => (e.fromNodeId === node.id && e.toNodeId === atRiskNode?.id) || (e.toNodeId === node.id && e.fromNodeId === atRiskNode?.id));
    if (filter === 'blocked') {
      const blockedEdges = edges.filter(e => e.type === 'blocked');
      return !blockedEdges.some(e => e.fromNodeId === node.id || e.toNodeId === node.id);
    }
    return false;
  };

  const isEdgeDimmed = (edge: GraphEdge) => {
    if (filter === 'all') return false;
    if (filter === 'at-risk') return edge.fromNodeId !== atRiskNode?.id && edge.toNodeId !== atRiskNode?.id;
    if (filter === 'blocked') return edge.type !== 'blocked';
    return false;
  };

  return (
    <div
      className={cn(
        "w-full h-full bg-bg relative overflow-hidden group/canvas select-none",
        isPanning ? "cursor-grabbing" : isZenPanning ? "cursor-move" : "cursor-default"
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <GraphFilterBar activeFilter={filter} onFilterChange={setFilter} />

      <div className="absolute top-20 right-6 z-10 flex flex-col gap-2">
        {/* Zen Mode Indicator */}
        <AnimatePresence>
          {isZenPanning && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-3 py-1.5 rounded-full bg-amber-primary/20 border border-amber-primary/30 text-[10px] font-bold text-amber-primary flex items-center gap-2 backdrop-blur-md shadow-lg shadow-amber-primary/10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-primary animate-pulse" />
              ZEN PAN ACTIVE
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg glass-frosted text-[10px] font-mono transition-all border border-white/10 shadow-lg",
              history.length > 0
                ? "text-text-primary hover:text-amber-primary hover:bg-white/10"
                : "text-text-tertiary opacity-30 cursor-not-allowed"
            )}
            title="Undo Move (⌘Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="font-bold">UNDO</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-frosted text-[10px] font-mono text-text-secondary hover:text-at-risk hover:bg-at-risk/10 transition-all border border-white/10 shadow-lg group"
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-bold">RESET</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Overlay */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-bg/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm glass-frosted p-6 rounded-2xl border border-white/10 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-risk/10 flex items-center justify-center mx-auto mb-4 border border-risk/20">
                <RefreshCw className="w-6 h-6 text-risk" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">Reset dependencies?</h3>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">This will revert all nodes to their original positions and reset the view. You can undo this action once.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border-soft text-sm font-medium text-text-secondary hover:bg-white/5 transition-all text-balance"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 px-4 py-2 rounded-xl bg-risk text-white text-sm font-bold shadow-lg shadow-risk/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        viewBox="0 0 900 600"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full pointer-events-none"
      >
        <defs>
          <radialGradient id="risk-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,68,68,0.10)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="page-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,166,35,0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <g
          transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}
          style={{ transformOrigin: '0 0' }}
          className="pointer-events-auto"
        >
          <circle cx="450" cy="300" r="400" fill="url(#page-ambient)" />

          {atRiskNode && (
            <motion.circle
              cx={atRiskNode.x}
              cy={atRiskNode.y}
              r="130"
              fill="url(#risk-ambient)"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}

          {edges.map(edge => {
            const from = nodes.find(n => n.id === edge.fromNodeId)!;
            const to = nodes.find(n => n.id === edge.toNodeId)!;
            return (
              <Fragment key={edge.id}>
                <GraphEdgeComponent
                  edge={edge}
                  from={from}
                  to={to}
                  isDimmed={isEdgeDimmed(edge)}
                />
              </Fragment>
            );
          })}

          {nodes.map(node => (
            <Fragment key={node.id}>
              <GraphNodeComponent
                node={node}
                isHovered={hoveredNodeId === node.id}
                isDimmed={isNodeDimmed(node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onDrag={handleNodeDrag}
              />
            </Fragment>
          ))}
        </g>
      </svg>

      {hoveredNode && (
        <GraphTooltip
          node={hoveredNode}
          position={{
            x: offset.x + (hoveredNode.x * scale),
            y: offset.y + (hoveredNode.y * scale)
          }}
        />
      )}

      <GraphLegend />
      <div className="absolute bottom-6 right-6 glass-frosted p-1 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </div>
    </div>
  );
}
