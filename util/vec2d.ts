export type Vec2 = [number, number];

export const eq = ([x1, y1]: Vec2, [x2, y2]: Vec2) => x1 === x2 && y1 === y2;
export const ne = ([x1, y1]: Vec2, [x2, y2]: Vec2) => x1 !== x2 || y1 !== y2;

export const mkEq = (p1: Vec2) => (p2: Vec2) => eq(p1, p2);
export const mkNe = (p1: Vec2) => (p2: Vec2) => ne(p1, p2);

export const add = ([x1, y1]: Vec2, [x2, y2]: Vec2): Vec2 => [x1 + x2, y1 + y2];
export const sub = ([x1, y1]: Vec2, [x2, y2]: Vec2): Vec2 => [x1 - x2, y1 - y2];

// TODO