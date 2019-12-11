export const ne = ([x1, y1], [x2, y2]) => x1 !== x2 || y1 !== y2;
export const mkNe = (p1) => (p2) => ne(p1, p2);
export const eq = ([x1, y1], [x2, y2]) => x1 === x2 && y1 === y2;
export const mkEq = (p1) => (p2) => eq(p1, p2);

export const add = ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2];
export const sub = ([x1, y1], [x2, y2]) => [x1 - x2, y1 - y2];

// TODO