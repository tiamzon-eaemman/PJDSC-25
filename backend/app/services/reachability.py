from typing import List, Tuple, Dict, Any
import networkx as nx
from shapely.geometry import shape
from app.services.routing import build_graph, edge_line


def unreachable_nodes(
    nodes: List[Tuple[str, float, float]],
    edges: List[Tuple[str, str, float]],
    hazard_geojson: List[Dict[str, Any]],
) -> List[str]:
    g = build_graph(nodes, edges)
    hazard_shapes = [shape(geo) for geo in hazard_geojson]

    # Remove edges that intersect hazards (impassable)
    to_remove = []
    for a, b in g.edges():
        seg = edge_line(g, a, b)
        if any(seg.intersects(hz) for hz in hazard_shapes):
            to_remove.append((a, b))
    g.remove_edges_from(to_remove)

    # Nodes with no connections or in isolated components
    unreachable = [n for n in g.nodes() if g.degree(n) == 0]
    return unreachable

