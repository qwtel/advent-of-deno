export type Vec3 = [number?, number?, number?];

export const eq = ([x1, y1, z1]: Vec3 = [], [x2, y2, z2]: Vec3 = []) => x1 === x2 && y1 === y2 && z1 === z2;
export const ne = ([x1, y1, z1]: Vec3 = [], [x2, y2, z2]: Vec3 = []) => x1 !== x2 || y1 !== y2 || z1 !== z2;

export const mkEq = (p1: Vec3 = []) => (p2: Vec3 = []) => eq(p1, p2);
export const mkNe = (p1: Vec3 = []) => (p2: Vec3 = []) => ne(p1, p2);

export const add = ([x1, y1, z1]: Vec3 = [], [x2, y2, z2]: Vec3 = []): Vec3 => [x1 + x2, y1 + y2, z1 + z2];
export const sub = ([x1, y1, z1]: Vec3 = [], [x2, y2, z2]: Vec3 = []): Vec3 => [x1 - x2, y1 - y2, z1 - z2];

// TODO
