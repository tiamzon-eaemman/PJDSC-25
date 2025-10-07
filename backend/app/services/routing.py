from typing import List, Tuple, Dict, Any
import networkx as nx
from shapely.geometry import LineString, shape


def build_graph(nodes: List[Tuple[str, float, float]], edges: List[Tuple[str, str, float]]) -> nx.Graph:
    g = nx.Graph()
    for node_id, lat, lon in nodes:
        g.add_node(node_id, lat=lat, lon=lon)
    for a, b, dist in edges:
        g.add_edge(a, b, weight=dist)
    return g


def edge_line(g: nx.Graph, a: str, b: str) -> LineString:
    pa = (g.nodes[a]["lon"], g.nodes[a]["lat"])  # x=lon, y=lat
    pb = (g.nodes[b]["lon"], g.nodes[b]["lat"])  # x=lon, y=lat
    return LineString([pa, pb])


def compute_route(
    nodes: List[Tuple[str, float, float]],
    edges: List[Tuple[str, str, float]],
    start: str,
    goal: str,
    hazard_geojson: List[Dict[str, Any]],
    hazard_penalty: float = 1000.0,
) -> Dict[str, Any]:
    g = build_graph(nodes, edges)
    hazard_shapes = [shape(geo) for geo in hazard_geojson]

    # Increase weights for edges intersecting hazards
    for a, b, data in g.edges(data=True):
        seg = edge_line(g, a, b)
        penalty = 0.0
        for hz in hazard_shapes:
            if seg.intersects(hz):
                penalty = max(penalty, hazard_penalty)
        data["weight"] = float(data.get("weight", 1.0)) + penalty

    path = nx.shortest_path(g, start, goal, weight="weight")
    total_cost = nx.path_weight(g, path, weight="weight")
    coords = [(g.nodes[n]["lat"], g.nodes[n]["lon"]) for n in path]
    return {"nodePath": path, "coordinates": coords, "cost": total_cost}

