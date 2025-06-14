import ReactFlow, { MiniMap, Controls, Background, Node, Edge, Position } from 'reactflow';
import 'reactflow/dist/style.css';

// Função que transforma os dados da nossa API no formato que o React Flow entende
const processChainData = (chainData: any[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  chainData.forEach((cert, index) => {
    const nodeId = `cert-${index}`;
    nodes.push({
      id: nodeId,
      type: 'default',
      data: { 
        label: (
          <div className="p-2 text-left text-xs w-64">
            <p className="font-bold text-primary">{cert.subject.CN || cert.subject.O}</p>
            <p className="text-muted-foreground mt-1">
              <span className="font-semibold">Emitido por:</span> {cert.issuer.CN || cert.issuer.O}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Válido até: {new Date(cert.validTo).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )
      },
      position: { x: 0, y: index * 160 }, // Posiciona os nós verticalmente
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
    });

    // Cria uma aresta conectando ao certificado anterior (seu emissor na cadeia)
    if (index > 0) {
      const parentNodeId = `cert-${index - 1}`;
      edges.push({
        id: `edge-${parentNodeId}-${nodeId}`,
        source: nodeId,
        target: parentNodeId,
        animated: true,
        type: 'smoothstep',
        style: { strokeWidth: 2 }
      });
    }
  });
  return { nodes, edges };
};

export const ChainVisualizer = ({ chainData }: { chainData: any[] }) => {
  if (!chainData || chainData.length === 0) {
    return <div className="h-[500px] flex items-center justify-center">Nenhum dado da cadeia para exibir.</div>;
  }

  const { nodes, edges } = processChainData(chainData);

  return (
    <div style={{ height: '500px' }} className="bg-background rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background gap={16} size={1} color="#292929" />
      </ReactFlow>
    </div>
  );
};