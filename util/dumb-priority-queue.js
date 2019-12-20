import { pipe, minByKey } from "./lilit.ts"

export class DumbPriorityQueue {
  constructor(init) {
    this.q = new Map(init || [])
  }

  pop() {
    const res = pipe(this.q, minByKey(0))
    if (res) this.q.delete(res[0])
    return res
  }

  push([p, v]) {
    this.q.set(p, v)
    // console.log(pipe(this.q, mapValues(_ => _.join('')), toMap()))
  }

  *[Symbol.iterator]() {
    let x; while (x = this.pop()) yield x
  }
}
