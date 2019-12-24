export type Vec2 = [number, number];

export const eq = ([x1, y1]: Vec2 = [undefined, undefined], [x2, y2]: Vec2 = [undefined, undefined]) => x1 === x2 && y1 === y2;
export const ne = ([x1, y1]: Vec2 = [undefined, undefined], [x2, y2]: Vec2 = [undefined, undefined]) => x1 !== x2 || y1 !== y2;

export const mkEq = (p1: Vec2) => (p2: Vec2) => eq(p1, p2);
export const mkNe = (p1: Vec2) => (p2: Vec2) => ne(p1, p2);

export const add = ([x1, y1]: Vec2 = [undefined, undefined], [x2, y2]: Vec2 = [undefined, undefined]): Vec2 => [x1 + x2, y1 + y2];
export const sub = ([x1, y1]: Vec2 = [undefined, undefined], [x2, y2]: Vec2 = [undefined, undefined]): Vec2 => [x1 - x2, y1 - y2];

export const addTo = (v1: Vec2) => (v2: Vec2) => add(v1, v2)
export const subFrom = (v1: Vec2) => (v2: Vec2) => sub(v1, v2)

// TODO
