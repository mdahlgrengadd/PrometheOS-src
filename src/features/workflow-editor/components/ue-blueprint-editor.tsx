import React, { useState, useCallback, useRef } from 'react';

const BlueprintEditor = () => {
  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: 'event',
      position: { x: 50, y: 50 },
      data: { 
        label: 'On Component Begin Overlap (Box)', 
        executionOut: true,
        outputs: [
          { name: 'Overlapped Component', type: 'component', color: '#00bfff' },
          { name: 'Other Actor', type: 'actor', color: '#0099ff' },
          { name: 'Other Comp', type: 'component', color: '#00bfff' },
          { name: 'Other Body Index', type: 'integer', color: '#00ff88' },
          { name: 'From Sweep', type: 'boolean', color: '#b71c1c' },
          { name: 'Sweep Result', type: 'struct', color: '#00bfff' }
        ]
      }
    },
    {
      id: '2',
      type: 'branch',
      position: { x: 650, y: 80 },
      data: { 
        label: 'Branch', 
        executionIn: true,
        inputs: [{ name: 'Condition', type: 'boolean', color: '#b71c1c' }],
        outputs: [
          { name: 'True', type: 'execution', color: '#ffffff' },
          { name: 'False', type: 'execution', color: '#ffffff' }
        ]
      }
    },
    {
      id: '3',
      type: 'variable',
      position: { x: 50, y: 300 },
      data: { 
        label: 'Get Player Pawn',
        inputs: [{ name: 'Player Index', type: 'integer', color: '#00ff88', defaultValue: '0' }],
        outputs: [{ name: 'Return Value', type: 'pawn', color: '#0099ff' }]
      }
    },
    {
      id: '4',
      type: 'cast',
      position: { x: 400, y: 350 },
      data: { 
        label: 'Cast To Character',
        executionIn: true,
        inputs: [{ name: 'Object', type: 'object', color: '#00bfff' }],
        outputs: [
          { name: 'Cast Failed', type: 'execution', color: '#ffffff' },
          { name: 'As Character', type: 'character', color: '#0099ff' }
        ]
      }
    },
    {
      id: '5',
      type: 'function',
      position: { x: 800, y: 200 },
      data: { 
        label: 'Launch Character',
        subtitle: 'Target is Character',
        executionIn: true,
        executionOut: true,
        inputs: [
          { name: 'Target', type: 'character', color: '#0099ff' },
          { name: 'Launch Velocity', type: 'vector', color: '#ffaa00', defaultValue: 'X:0.0 Y:0.0 Z:0.0' },
          { name: 'XYOverride', type: 'boolean', color: '#b71c1c' },
          { name: 'ZOverride', type: 'boolean', color: '#b71c1c' }
        ]
      }
    }
  ]);

  const [connections, setConnections] = useState([
    { id: 'conn1', from: '1', to: '2', type: 'execution' },
    { id: 'conn2', from: '3', fromPin: 'Return Value', to: '4', toPin: 'Object', type: 'data' },
    { id: 'conn3', from: '4', fromPin: 'As Character', to: '5', toPin: 'Target', type: 'data' },
    { id: 'conn4', from: '2', fromPin: 'True', to: '5', type: 'execution' }
  ]);

  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedConnection, setSelectedConnection] = useState(null);

  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [nodes]);

  const handleMouseMove = useCallback((e) => {
    if (draggedNode) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setNodes(prev => prev.map(node => 
        node.id === draggedNode 
          ? {
              ...node,
              position: {
                x: e.clientX - containerRect.left - dragOffset.x,
                y: e.clientY - containerRect.top - dragOffset.y
              }
            }
          : node
      ));
    }
  }, [draggedNode, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const getPinPosition = (node, pinType, pinIndex = 0) => {
    const nodeWidth = 220;
    const headerHeight = 32;
    const pinHeight = 20;
    const pinSize = 8; // Updated for larger 3D pins
    
    let y = node.position.y + headerHeight;
    
    if (pinType === 'executionIn') {
      return { x: node.position.x - pinSize, y: y + 12 };
    } else if (pinType === 'executionOut') {
      return { x: node.position.x + nodeWidth + pinSize, y: y + 12 };
    } else if (pinType === 'input') {
      y += 30 + (pinIndex * pinHeight);
      return { x: node.position.x - pinSize, y: y + 2 };
    } else if (pinType === 'output') {
      y += 30 + (pinIndex * pinHeight);
      return { x: node.position.x + nodeWidth + pinSize, y: y + 2 };
    }
    
    return { x: node.position.x, y: node.position.y };
  };

  const handleConnectionClick = (connectionId, e) => {
    e.stopPropagation();
    setSelectedConnection(connectionId);
  };

  const deleteSelectedConnection = useCallback(() => {
    if (selectedConnection) {
      setConnections(prev => prev.filter(conn => conn.id !== selectedConnection));
      setSelectedConnection(null);
    }
  }, [selectedConnection]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Delete' && selectedConnection) {
      deleteSelectedConnection();
    }
  }, [selectedConnection, deleteSelectedConnection]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getNodeGradient = (nodeType) => {
    switch(nodeType) {
      case 'event':
        return 'linear-gradient(to bottom, #dc2626, #b91c1c)';
      case 'function':
        return 'linear-gradient(to bottom, #0ea5e9, #0284c7)';
      case 'branch':
        return 'linear-gradient(to bottom, #6b7280, #4b5563)';
      case 'cast':
        return 'linear-gradient(to bottom, #14b8a6, #0d9488)';
      default:
        return 'linear-gradient(to bottom, #16a34a, #15803d)';
    }
  };

  const renderNode = (node) => {
    const { id, position, data, type } = node;
    
    return (
      <div
        key={id}
        className="absolute cursor-move select-none z-10"
        style={{
          left: position.x,
          top: position.y,
          width: '220px'
        }}
        onMouseDown={(e) => handleMouseDown(e, id)}
      >
        <div 
          className="rounded-t-lg px-4 py-2 text-white text-sm font-medium relative"
          style={{
            background: getNodeGradient(type),
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.3),
              inset 0 -1px 0 rgba(0,0,0,0.3),
              inset 1px 0 0 rgba(255,255,255,0.2),
              inset -1px 0 0 rgba(0,0,0,0.2),
              0 2px 4px rgba(0,0,0,0.4)
            `,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            borderLeft: '1px solid rgba(255,255,255,0.15)',
            borderRight: '1px solid rgba(0,0,0,0.3)',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          {data.label}
          {data.subtitle && (
            <div className="text-xs opacity-80 italic">{data.subtitle}</div>
          )}
        </div>
        
        <div className="relative" style={{
          background: 'linear-gradient(to bottom, #3a3a3a, #2a2a2a)',
          borderRadius: '0 0 8px 8px',
          border: '2px solid #1a1a1a',
          borderTop: 'none',
          boxShadow: `
            inset 0 2px 4px rgba(0,0,0,0.6),
            inset 0 -1px 0 rgba(255,255,255,0.05),
            inset 2px 0 0 rgba(0,0,0,0.3),
            inset -2px 0 0 rgba(0,0,0,0.3),
            0 1px 2px rgba(0,0,0,0.3)
          `
        }}>
          <div className="flex justify-between items-center px-2 py-2 min-h-[24px]">
            {data.executionIn && (
              <div className="absolute -left-[8px] top-[10px] z-20">
                <div 
                  className="w-4 h-4 rounded-full cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                    border: '2px solid #999',
                    boxShadow: `
                      inset 0 1px 0 rgba(255,255,255,0.8),
                      inset 0 -1px 0 rgba(0,0,0,0.2),
                      inset 1px 0 0 rgba(255,255,255,0.5),
                      inset -1px 0 0 rgba(0,0,0,0.1),
                      0 2px 4px rgba(0,0,0,0.4),
                      0 0 0 1px rgba(255,255,255,0.2)
                    `
                  }}
                ></div>
              </div>
            )}
            {data.executionOut && (
              <div className="absolute -right-[8px] top-[10px] z-20">
                <div 
                  className="w-4 h-4 rounded-full cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                    border: '2px solid #999',
                    boxShadow: `
                      inset 0 1px 0 rgba(255,255,255,0.8),
                      inset 0 -1px 0 rgba(0,0,0,0.2),
                      inset 1px 0 0 rgba(255,255,255,0.5),
                      inset -1px 0 0 rgba(0,0,0,0.1),
                      0 2px 4px rgba(0,0,0,0.4),
                      0 0 0 1px rgba(255,255,255,0.2)
                    `
                  }}
                ></div>
              </div>
            )}
          </div>
          
          {data.inputs && data.inputs.map((input, idx) => (
            <div key={idx} className="flex items-center px-2 py-1 relative min-h-[20px]">
              <div className="absolute -left-[8px] z-20">
                <div 
                  className="w-4 h-4 rounded-full cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${input.color} 0%, ${input.color}cc 100%)`,
                    border: '2px solid #666',
                    boxShadow: `
                      inset 0 1px 0 rgba(255,255,255,0.4),
                      inset 0 -1px 0 rgba(0,0,0,0.3),
                      inset 1px 0 0 rgba(255,255,255,0.3),
                      inset -1px 0 0 rgba(0,0,0,0.2),
                      0 2px 4px rgba(0,0,0,0.4),
                      0 0 0 1px rgba(255,255,255,0.1)
                    `
                  }}
                ></div>
              </div>
              <div className="ml-4 flex-1">
                <span className="text-white text-xs">{input.name}</span>
                {input.defaultValue && (
                  <div className="text-gray-400 text-xs mt-0.5">{input.defaultValue}</div>
                )}
              </div>
            </div>
          ))}
          
          {data.outputs && data.outputs.map((output, idx) => (
            <div key={idx} className="flex items-center justify-end px-2 py-1 relative min-h-[20px]">
              <div className="mr-4 flex-1 text-right">
                <span className="text-white text-xs">{output.name}</span>
                {output.type === 'execution' && type === 'branch' && (
                  <div className="inline-block ml-2 px-1 text-xs bg-gray-700 rounded">
                    {output.name === 'True' ? '▷' : '▷'}
                  </div>
                )}
              </div>
              <div className="absolute -right-[8px] z-20">
                <div 
                  className="w-4 h-4 rounded-full cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${output.color} 0%, ${output.color}cc 100%)`,
                    border: '2px solid #666',
                    boxShadow: `
                      inset 0 1px 0 rgba(255,255,255,0.4),
                      inset 0 -1px 0 rgba(0,0,0,0.3),
                      inset 1px 0 0 rgba(255,255,255,0.3),
                      inset -1px 0 0 rgba(0,0,0,0.2),
                      0 2px 4px rgba(0,0,0,0.4),
                      0 0 0 1px rgba(255,255,255,0.1)
                    `
                  }}
                ></div>
              </div>
            </div>
          ))}
          
          {!data.inputs && !data.outputs && (
            <div className="py-2"></div>
          )}
        </div>
      </div>
    );
  };

  const renderConnection = (connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;
    
    let fromPos, toPos;
    
    if (connection.type === 'execution') {
      fromPos = getPinPosition(fromNode, 'executionOut');
      toPos = getPinPosition(toNode, 'executionIn');
    } else {
      const fromOutputIndex = fromNode.data.outputs ? 
        fromNode.data.outputs.findIndex(o => o.name === connection.fromPin) : 0;
      const toInputIndex = toNode.data.inputs ? 
        toNode.data.inputs.findIndex(i => i.name === connection.toPin) : 0;
      
      fromPos = getPinPosition(fromNode, 'output', fromOutputIndex);
      toPos = getPinPosition(toNode, 'input', toInputIndex);
    }
    
    const deltaX = toPos.x - fromPos.x;
    const controlOffset = Math.abs(deltaX) * 0.4 + 50;
    
    const pathData = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + controlOffset} ${fromPos.y} ${toPos.x - controlOffset} ${toPos.y} ${toPos.x} ${toPos.y}`;
    
    const isSelected = selectedConnection === connection.id;
    
    return (
      <g key={connection.id}>
        <path
          d={pathData}
          stroke="transparent"
          strokeWidth="16"
          fill="none"
          className="cursor-pointer"
          onClick={(e) => handleConnectionClick(connection.id, e)}
        />
        <path
          d={pathData}
          stroke={isSelected ? '#ffff00' : (connection.type === 'execution' ? '#ffffff' : '#00bfff')}
          strokeWidth={isSelected ? "5" : "4"}
          fill="none"
          className="cursor-pointer pointer-events-none"
          style={{ 
            filter: isSelected 
              ? 'drop-shadow(0px 0px 8px #ffff00) drop-shadow(0px 2px 4px rgba(0,0,0,0.6))' 
              : 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8)) drop-shadow(0px 0px 3px rgba(255,255,255,0.2))',
            strokeLinecap: 'round'
          }}
        />
      </g>
    );
  };

  return (
    <div className="w-full h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
      boxShadow: 'inset 0 0 100px rgba(0,0,0,0.3)'
    }}>
      {/* Textured Grid Background */}
      <div 
        className="absolute inset-0 opacity-30 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100px 100px'
        }}
      ></div>
      
      <div 
        ref={containerRef}
        className="w-full h-full relative z-0"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedConnection(null)}
      >
        <svg className="absolute inset-0 w-full h-full z-5" style={{ zIndex: 5 }}>
          {connections.map(renderConnection)}
        </svg>
        
        {nodes.map(renderNode)}
        
        <div className="absolute top-4 left-4 z-20" style={{
          background: 'linear-gradient(to bottom, #4a4a4a, #2a2a2a)',
          borderRadius: '8px',
          border: '2px solid #1a1a1a',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.2),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            inset 1px 0 0 rgba(255,255,255,0.1),
            inset -1px 0 0 rgba(0,0,0,0.2),
            0 4px 8px rgba(0,0,0,0.4)
          `,
          padding: '12px'
        }}>
          <h3 className="text-white text-sm font-medium mb-3" style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}>Blueprint Graph</h3>
          <div className="flex flex-col gap-3">
            <button className="px-3 py-2 rounded text-xs font-medium transition-all" style={{
              background: 'linear-gradient(to bottom, #dc2626, #b91c1c)',
              color: 'white',
              border: '1px solid #991b1b',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `
            }} onMouseDown={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.4)'} 
               onMouseUp={(e) => e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'}>
              Add Event
            </button>
            <button className="px-3 py-2 rounded text-xs font-medium transition-all" style={{
              background: 'linear-gradient(to bottom, #0ea5e9, #0284c7)',
              color: 'white',
              border: '1px solid #0369a1',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `
            }} onMouseDown={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.4)'} 
               onMouseUp={(e) => e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'}>
              Add Function
            </button>
            <button className="px-3 py-2 rounded text-xs font-medium transition-all" style={{
              background: 'linear-gradient(to bottom, #16a34a, #15803d)',
              color: 'white',
              border: '1px solid #166534',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `
            }} onMouseDown={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.4)'} 
               onMouseUp={(e) => e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'}>
              Add Variable
            </button>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 w-64 z-20" style={{
          background: 'linear-gradient(to bottom, #4a4a4a, #2a2a2a)',
          borderRadius: '8px',
          border: '2px solid #1a1a1a',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.2),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            inset 1px 0 0 rgba(255,255,255,0.1),
            inset -1px 0 0 rgba(0,0,0,0.2),
            0 4px 8px rgba(0,0,0,0.4)
          `,
          padding: '12px'
        }}>
          <h3 className="text-white text-sm font-medium mb-3" style={{
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}>Details</h3>
          <div className="text-gray-300 text-xs">
            <div className="mb-3 p-2 rounded" style={{
              background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
              border: '1px solid #444',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)'
            }}>
              <div className="text-gray-400 text-xs mb-1">Selected:</div>
              <div className="text-white">{selectedConnection ? 'Connection' : 'None'}</div>
            </div>
            {selectedConnection && (
              <div className="mb-3">
                <button 
                  onClick={deleteSelectedConnection}
                  className="w-full px-3 py-2 rounded text-xs font-medium transition-all"
                  style={{
                    background: 'linear-gradient(to bottom, #dc2626, #b91c1c)',
                    color: 'white',
                    border: '1px solid #991b1b',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    boxShadow: `
                      inset 0 1px 0 rgba(255,255,255,0.3),
                      inset 0 -1px 0 rgba(0,0,0,0.3),
                      0 2px 4px rgba(0,0,0,0.3)
                    `
                  }}
                >
                  Delete Connection
                </button>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded" style={{
                background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
                border: '1px solid #444',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)'
              }}>
                <span className="text-gray-400">Nodes:</span>
                <span className="text-white">{nodes.length}</span>
              </div>
              <div className="flex justify-between p-2 rounded" style={{
                background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
                border: '1px solid #444',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)'
              }}>
                <span className="text-gray-400">Connections:</span>
                <span className="text-white">{connections.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-16 left-4 z-20" style={{
          background: 'linear-gradient(to bottom, #4a4a4a, #2a2a2a)',
          borderRadius: '8px',
          border: '2px solid #1a1a1a',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.2),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            inset 1px 0 0 rgba(255,255,255,0.1),
            inset -1px 0 0 rgba(0,0,0,0.2),
            0 4px 8px rgba(0,0,0,0.4)
          `,
          padding: '12px'
        }}>
          <div className="text-gray-300 text-xs">
            <div className="text-white font-medium mb-2" style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}>Controls:</div>
            <div className="space-y-1">
              <div>• Drag nodes to move them</div>
              <div>• Click connections to select</div>
              <div>• Press Delete to remove selected connection</div>
              <div>• Hover over pins to see interaction</div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 z-20" style={{
          background: 'linear-gradient(to bottom, #3a3a3a, #2a2a2a)',
          borderTop: '2px solid #1a1a1a',
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 -2px 4px rgba(0,0,0,0.3)
          `,
          padding: '8px 16px'
        }}>
          <div className="flex justify-between items-center text-gray-300 text-xs">
            <div className="font-medium" style={{
              textShadow: '0 1px 1px rgba(0,0,0,0.8)'
            }}>Blueprint: FirstPersonCharacter</div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span>Nodes:</span>
                <span className="font-mono bg-black bg-opacity-30 px-2 py-1 rounded border border-gray-600">
                  {nodes.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Connections:</span>
                <span className="font-mono bg-black bg-opacity-30 px-2 py-1 rounded border border-gray-600">
                  {connections.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: '1px solid #047857',
                    boxShadow: `
                      inset 0 1px 0 rgba(255,255,255,0.3),
                      inset 0 -1px 0 rgba(0,0,0,0.2),
                      0 0 4px rgba(16,185,129,0.5)
                    `
                  }}
                ></div>
                <span>Compiled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintEditor;