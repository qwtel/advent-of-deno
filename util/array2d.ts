import { ValMap, ValSet } from "./values.ts";
import { pipe, unzip2, minMax, find, product2, rangeX, filter, map, filterValues, flatMap, zipMap, pluckKeys, forEach } from "./iter.ts";
import { addTo, mkNe } from "./vec2.ts";
import { last } from "./other.ts";
import { Graph } from "./graph2.ts";

export type Point = [number, number];
export type Bounds = [[number, number], [number, number]];
export type PointMap<X> = ValMap<Point, X>;

export const neighbors4 = (point: Point = [0, 0]) => pipe([[0, -1], [0, 1], [-1, 0], [1, 0]], map(addTo(point))) as IterableIterator<Point>
export const neighbors8 = (point: Point = [0, 0]) => pipe(product2(rangeX(-1, 1), rangeX(-1, 1)), filter(mkNe([0, 0])), map(addTo(point))) as IterableIterator<Point>;

const BARE = Symbol('bare') as any;

export class Array2D<X> {
    private _bounds: Bounds;
    private _array: X[][];

    static of<X>(arr2D: X[][], bounds: Bounds = [[0, 0], [arr2D[0].length, arr2D.length]]): Array2D<X> {
        const a = new Array2D<X>(bounds);
        for (const p of a.coords()) {
            const [ix, iy] = a._pointToIndex(p);
            a.set(p, arr2D[iy][ix]);
        }
        return a;
    }

    static fromString(s: string, bounds?: Bounds) {
        return Array2D.of(s.split('\n').map(_ => _.split('')), bounds)
    }

    static fromMinMax<X>([[minX, maxX], [minY, maxY]]: Bounds, fill: X) {
        return new Array2D<X>([[minX, minY], [maxX + 1, maxY + 1]], fill);
    }

    static fromPointMap<X>(pointMap: Iterable<[Point, X]>, fill: X) {
        pointMap = [...pointMap];
        const a = pipe(
            pointMap,
            pluckKeys(),
            unzip2(),
            ([xs, ys]) => [minMax()(xs), minMax()(ys)],
            _ => Array2D.fromMinMax(_ as Bounds, fill),
        );
        pipe(pointMap, forEach(([point, value]: [Point, X]) => a.set(point, value)));
        return a;
    }

    constructor(bounds: Bounds = [[0, 0], [1, 1]], fill: any = 0) {
        if (bounds as any === BARE) return;
        const [[minX, minY], [maxX, maxY]] = this._bounds = bounds;
        const [diffX, diffY] = [maxX - minX, maxY - minY];
        this._array = new Array(diffY).fill(fill).map(() => new Array(diffX).fill(fill));
    }

    private _pointToIndex([x, y]: Point): [number, number] {
        const [[minX, minY]] = this.bounds;
        return [x - minX, y - minY];
    }

    private _indexToPoint(ix: number, iy: number): Point {
        const [[minX, minY]] = this.bounds;
        return [ix + minX, iy + minY];
    }

    copy(): Array2D<X> {
        const a = new Array2D<X>(BARE);
        const { array, bounds } = this; // implicit clone
        a._array = array;
        a._bounds = bounds;
        return a;
    }

    clone(): Array2D<X> {
        return this.copy();
    }

    *[Symbol.iterator](): IterableIterator<X> {
        for (const row of this._array)
            for (const cell of row)
                yield cell;
    }

    forEach(f: (x: X, p?: Point, self?: Array2D<X>) => {}): void {
        this._array.forEach((row, iy) =>
            row.forEach((x, ix) =>
                f(x, this._indexToPoint(ix, iy), this)));
    }

    map<Y>(f: (x: X, p?: Point, self?: Array2D<X>) => Y): Array2D<Y> {
        const a = new Array2D<Y>(BARE);
        a._array = this._array.map((row, iy) =>
            row.map((c, ix) => f(c, this._indexToPoint(ix, iy), this)));
        a._bounds = this.bounds;
        return a;
    }

    find(f: (x: X, p?: Point, self?: Array2D<X>) => boolean): X {
        return pipe(this.entries(), find(([p, x]) => f(x, p, this)), _ => _ && _[1]);
    }

    findPoint(f: (x: X, p?: Point, self?: Array2D<X>) => boolean): Point {
        return pipe(this.entries(), find(([p, x]) => f(x, p, this)), _ => _ && _[0]);
    }

    neighbors4(p: Point) { 
        return pipe(neighbors4(p), filter(this.isInside));
    }

    neighbors8(p: Point) { 
        return pipe(neighbors8(p), filter(this.isInside));
    }

    neighboringEntries4(p: Point) { 
        return pipe(neighbors4(p), filter(this.isInside), zipMap(_ => this.get(_)));
    }

    neighboringEntries8(p: Point) { 
        return pipe(neighbors8(p), filter(this.isInside), zipMap(_ => this.get(_)));
    }

    neighboringValues4(p: Point) { 
        return pipe(neighbors4(p), filter(this.isInside), map(_ => this.get(_)));
    }

    neighboringValues8(p: Point) { 
        return pipe(neighbors8(p), filter(this.isInside), map(_ => this.get(_)));
    }

    bfs4(start: Point, goals: Set<X>, walkable: Set<X>) {
        return bfs(this, start, goals, walkable, this.neighbors4);
    }

    bfs8(start: Point, goals: Set<X>, walkable: Set<X>) {
        return bfs(this, start, goals, walkable, this.neighbors8);
    }

    set(point: Point, value: X): Array2D<X> {
        const [ix, iy] = this._pointToIndex(point);
        this._array[iy][ix] = value;
        return this;
    }

    get(point: Point): X {
        const [ix, iy] = this._pointToIndex(point);
        if (this.isOutside(point)) return undefined;
        return this._array[iy][ix];
    }

    get dims(): [number, number] {
        return [this._array.length, this._array[0].length];
    }

    get size(): number { return this._array.length * this._array[0].length; }
    get sizeX(): number { return this._array[0].length; } 
    get sizeY(): number { return this._array.length; }

    get length(): number { return this._array.length * this._array[0].length; }
    get lengthX(): number { return this._array[0].length; } 
    get lengthY(): number { return this._array.length; }

    get array(): X[][] { return this._array.map(row => [...row]); }
    get bounds(): Bounds { return this._bounds.map(([x, y]) => [x, y]) as Bounds; }

    transpose(): Array2D<X> {
        const a = new Array2D<X>(BARE);
        a._array = this._array[0].map((_, i) => this._array.map(r => r[i]));
        a._bounds = this.bounds;
        return a;
    }

    rotate(): Array2D<X> {
        const a = this.transpose();
        a._array.forEach(row => row.reverse())
        return a;
    }

    rotateCW() { return this.rotate(); }

    rotateCCW(): Array2D<X> {
        const a = this.clone();
        a._array.forEach(row => row.reverse())
        return a.transpose();
    }

    // TODO: this is probably not doing what you'd expect
    *rows(): IterableIterator<Array<X>> {
        for (const row of this.clone()._array) yield row;
    }

    // TODO: this is probably not doing what you'd expect
    *columns(): IterableIterator<Array<X>> {
        for (const col of this.transpose()._array) yield col;
    }

    *coords(): IterableIterator<Point> {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        for (let y = minY; y < maxY; y++)
            for (let x = minX; x < maxX; x++)
                yield [x, y];
    }

    *values(): IterableIterator<X> {
        for (const row of this._array)
            for (const cell of row) 
                yield cell;
    }

    *entries(): IterableIterator<[Point, X]> {
        for (const [iy, row] of this._array.entries())
            for (const [ix, cell] of row.entries())
                yield [this._indexToPoint(ix, iy), cell];
    }

    // delivers all the edge coordinates in clockwise fashion
    // including min, excluding max
    *edgeCoords(): IterableIterator<Point> {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        for (let x = minX; x < maxX; x++) yield [x, minY];
        for (let y = minY + 1; y < maxY; y++) yield [maxX - 1, y];
        for (let x = maxX - 2; x >= minX; x--) yield [x, maxY - 1];
        for (let y = maxY - 2; y >= minY + 1; y--) yield [minX, y];
    }

    *edgeValues(): IterableIterator<X> {
        for (const p of this.edgeCoords()) yield this.get(p);
    }

    *edgeEntries(): IterableIterator<[Point, X]> {
        for (const p of this.edgeCoords()) yield [p, this.get(p)];
    }

    isInside = ([x, y]: Point): boolean => {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        return x >= minX && x < maxX && y >= minY && y < maxY;
    }

    isOutside = ([x, y]: Point): boolean => {
        const [[minX, minY], [maxX, maxY]] = this._bounds;
        return x < minX || x >= maxX || y < minY || y >= maxY;
    }

    toString(): string {
        let s = ''
        for (const r of this.rows()) s += r.join('') + '\n';
        return s;
    }

    toPointMap(): PointMap<X> {
        return new ValMap(this.entries())
    }

    /**
     * Compacts the 2D array into a `Graph` of shortest distances between `goals` along `walkable` fields.
     * Each goal becomes a node in the graph, and each edge represents the shortest distance between them.
     */
    compactWorld(targets: Iterable<X>, walkable: Iterable<X>): Graph<X> {
        const [targetSet, walkableSet] = [targets, walkable].map(_ => new ValSet(_));
        return new Graph(pipe(
            this.entries(),
            filterValues(v => targetSet.has(v)),
            flatMap(([startPos, from]) => pipe(
                bfs(this, startPos, targetSet.clone().remove(from), walkableSet),
                map(([to, dist]) => [from, to, dist] as [X, X, number]),
            )),
        ));
    }

    // [Deno.customInspect]() { return this.toString(); }
}

export function* bfs<X>(
    world: { get: (p: Point) => X }, 
    start: Point, 
    goals: Iterable<X>, 
    walkable: Iterable<X>, 
    adjacent: (x: Point) => IterableIterator<Point> = neighbors4,
): IterableIterator<[X, number, Point[]]> {
    const goals2 = new ValSet(goals);
    const walkable2 = new ValSet(walkable);

    const qs = [[[start]], []];
    const seen = new ValSet([start]);
    let i = 0;

    while (true) {
        const q = qs[i % 2];
        const qNext = qs[(i + 1) % 2];

        const path = q.shift();
        for (const p of adjacent(last(path))) {
            const v = world.get(p);
            if (goals2.has(v)) {
                yield [v, i + 1, [...path, p]];
            }
            if (walkable2.has(v) && !seen.has(p)) {
                qNext.push([...path, p]);
                seen.add(p);
            }
        }

        if (q.length === 0) {
            if (qNext.length !== 0) i++;
            else break;
        }
    }
}
