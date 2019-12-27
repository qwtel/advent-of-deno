import { pipe, map, min, filter, pairwise, flatten, toArray, sum, flatMap, product2, concat2, zipMap } from "./iter.ts";
import { findAndRemove } from "./other.ts";
import { ValMap, ValSet, is } from "./values.ts";

export type Edge<X> = [X, X];
export type WeightedEdge<X> = [X, X, number];
export type MaybeWeightedEdge<X> = Edge<X> | WeightedEdge<X>;

export class Graph<X> {
  vertices: ValSet<X>;
  dirs: ValMap<X, ValSet<X>>;
  deps: ValMap<X, ValSet<X>>;
  weights: ValMap<[X, X], number>;

  constructor(data: Iterable<MaybeWeightedEdge<X>> | Graph<X>) {
    if (data instanceof Graph) return this._copyFrom(data);

    const data2 = [...data];
    const edges = pipe(data2, map(([a, b]) => [a, b] as Edge<X>), toArray());
    this.vertices = new ValSet([...pipe(edges, flatten<X>())]);
    this.dirs = new ValMap(pipe(this.vertices, zipMap(() => new ValSet<X>())));
    this.deps = new ValMap(pipe(this.vertices, zipMap(() => new ValSet<X>())));
    this.weights = new ValMap();

    for (const [a, b, w] of data2) {
      this.dirs.set(a, this.dirs.get(a).add(b));
      this.deps.set(b, this.deps.get(b).add(a));
      this.weights.set([a, b], w ?? 1);
    }
  }

  private _copyFrom(data: Graph<X>) {
    this.vertices = new ValSet(data.vertices);
    this.dirs = new ValMap(data.dirs);
    this.deps = new ValMap(data.deps);
    this.weights = new ValMap(data.weights);
    return this;
  }

  get edges(): ValSet<Edge<X>> {
    return new ValSet(pipe(
      this.dirs,
      flatMap(([a, bs]) => pipe(bs, map(b => [a, b] as Edge<X>))),
    ));
  }

  get weightedEdges(): ValSet<WeightedEdge<X>> { 
    return new ValSet(pipe(
      this.dirs,
      flatMap(([a, bs]) => pipe(bs, map(b => [a, b, this.weight([a, b])] as WeightedEdge<X>))),
    ));
  }

  incoming(v: X) { return this.deps.get(v).values(); }
  outgoing(v: X) { return this.dirs.get(v).values(); }
  neighbors(v: X) { return concat2(this.incoming(v), this.outgoing(v)); }

  weight(e: Edge<X>) { return this.weights.get(e); }
  totalWeight () { return pipe(this.weights.values(), sum()); }

  incomingEdges(v: X) { return pipe(this.incoming(v), map(u => [u, v, this.weight([u, v])] as WeightedEdge<X>)); }
  outgoingEdges(v: X) { return pipe(this.outgoing(v), map(u => [v, u, this.weight([v, u])] as WeightedEdge<X>)); }


  // SEARCH
  // ------

  // Walks the graph in bfs-like fashion, but will revisit nodes if they are encountered again.
  // Will not terminate for cyclic graphs!
  *walk(start: X) {
    const q = [start];
    for (const v of q) {
      yield v;
      q.push(...this.outgoing(v));
    }
  }
  
  bfs(source: X, target: X) {
    const q = [source];
    const prev = new ValMap<X, X>([[source, null]]);

    for (const curr of q) {
      for (const n of this.outgoing(curr)) {
        if (is(n, target)) {
          prev.set(n, curr);
          return unwind(prev, target);
        } else if (!prev.has(n)) { 
          prev.set(n, curr);
          q.push(n); 
        }
      }
    }

    // TODO: Not found?

  }

  dijkstra(source: X, target: X) {
    const q = [];
    const dist = new ValMap<X, number>();
    const prev = new ValMap<X, X>();

    for (const v of this.vertices) {
      dist.set(v, Number.POSITIVE_INFINITY);
      prev.set(v, undefined);
      q.push(v);
    }
    dist.set(source, 0);

    while (q.length) {
      // slooooooooooooooooooooow
      const shortest = pipe(q, map(_ => dist.get(_)), min());
      const u = findAndRemove(q, v => is(dist.get(v), shortest));

      if (is(u, target)) return unwind(prev, target);

      for (const v of pipe(this.outgoing(u), filter(v => q.includes(v)))) {
        const alt = dist.get(u) + this.weight([u, v]);
        if (alt < dist.get(v)) {
          dist.set(v, alt);
          prev.set(v, u);
        }
      }
    }

    // TODO: not found?
  }

  // dijkstra2(source: string, target: string) {
  //   const dist = new Map([[source, 0]]);
  //   const prev = new Map<string, string>();
  //   const q = new PriorityQueue([], ([a], [b]) => b - a)

  //   for (const v of this.vertices) {
  //     if (v !== source) dist.set(v, Number.POSITIVE_INFINITY)
  //     prev.set(v, undefined)
  //     q.push([dist.get(v), v])
  //   }

  //   for (const u of q) {
  //     for (const v of pipe(this.outgoing(u), filter(v => q.includes(v)))) {
  //   }
  // }
  // 1  function Dijkstra(Graph, source):
  // 2      dist[source] ← 0                           // Initialization
  // 3
  // 4      create vertex priority queue Q
  // 5
  // 6      for each vertex v in Graph:           
  // 7          if v ≠ source
  // 8              dist[v] ← INFINITY                 // Unknown distance from source to v
  // 9          prev[v] ← UNDEFINED                    // Predecessor of v
  // 10
  // 11         Q.add_with_priority(v, dist[v])
  // 12
  // 13
  // 14     while Q is not empty:                      // The main loop
  // 15         u ← Q.extract_min()                    // Remove and return best vertex
  // 16         for each neighbor v of u:              // only v that are still in Q
  // 17             alt ← dist[u] + length(u, v) 
  // 18             if alt < dist[v]
  // 19                 dist[v] ← alt
  // 20                 prev[v] ← u
  // 21                 Q.decrease_priority(v, alt)
  // 22
  // 23     return dist, prev


  // MUTATION
  // --------

  addEdge(e: MaybeWeightedEdge<X>) {
    const [a, b, w] = e;
    this.vertices.add(a).add(b);
    this.dirs.set(a, (this.dirs.get(a) || new ValSet()).add(b));
    this.deps.set(b, (this.deps.get(b) || new ValSet()).add(a));
    this.weights.set([a, b], w ?? 1);
    return this;
  }

  addEdges(...es: MaybeWeightedEdge<X>[]) {
    for (const e of es) this.addEdge(e);
    return this;
  }

  deleteEdge([a, b]: Edge<X>) {
    this.dirs.get(a).delete(b);
    this.deps.get(b).delete(a);
    return this.weights.delete([a, b])
  }

  deleteVertex(v: X) {
    for (const [a, b] of this.incomingEdges(v)) this.deleteEdge([a, b]);
    for (const [a, b] of this.outgoingEdges(v)) this.deleteEdge([a, b]);
    return this.vertices.delete(v);
  }

  deleteVertexWithCompaction(v: X) {
    const toAdd = pipe(
      product2(this.incomingEdges(v), this.outgoingEdges(v)),
      map(([[a, , w1], [, b, w2]]) => [a, b, w1 + w2] as WeightedEdge<X>),
      filter(([a, b]) => !is(a, b)),
      toArray(),
    );
    this.deleteVertex(v);
    this.addEdges(...toAdd);
  }

  copy() {
    return new Graph(this);
  }

  equals(b: any) {
    if (b instanceof Graph) {
      return is(this.vertices, b.vertices) && is(this.dirs, b.dirs) && is(this.deps, b.deps) && is(this.weights, b.weights);
    }
    return false;
  }
}

function unwind<X>(prev: Map<X, X>, target: X) {
  const path: X[] = [];
  let u = target;
  while (u) {
    path.unshift(u);
    u = prev.get(u);
  }
  return [...pipe(path, pairwise())];
}
