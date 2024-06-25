interface DataPoint {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly data: any
}
interface OctreeInterface {
  boundaries: Array<OctreeInterface>
  points: Array<DataPoint>

  inBounds(point: DataPoint): boolean
  insert(point: DataPoint): void
  insertDataSet(points: Array<DataPoint>): void
  flatten(node?: OctreeInterface): Array<DataPoint>
}

const Octree = class implements OctreeInterface {
  private readonly width: number
  private readonly height: number
  private readonly depth: number
  public readonly x: number
  public readonly y: number
  public readonly z: number
  private capacity: number

  public boundaries: Array<OctreeInterface>
  public points: Array<DataPoint>
  constructor(width: number, height: number, depth: number, x: number, y: number,  z: number, capacity: number = 4,) {
    this.width = width
    this.height = height
    this.depth = depth
    this.x = x
    this.y = y
    this.z = z
    this.capacity = capacity

    this.boundaries = []
    this.points = []
  }
  public inBounds(point: DataPoint): boolean {
    return (
      point.x >= this.x && point.x < this.x + this.width &&
      point.y >= this.y && point.y < this.y + this.height &&
      point.z >= this.z && point.z < this.z + this.depth
    )
  }
  public insert(point: DataPoint): void {
    if (!this.inBounds(point)) return

    if (this.points.length < this.capacity) {
      this.points.push(point)
      return
    }

    if (this.boundaries.length === 0)
      this.subdivide()

    for (let bounds of this.boundaries) {
      if (bounds.inBounds(point))
        bounds.insert(point)
    }
  }
  public insertDataSet(points: Array<DataPoint>): void {
    for (let point of points)
      this.insert(point)
  }
  private subdivide(): void {
    let subWidth: number = Math.floor(this.width * 0.5)
    let subHeight: number = Math.floor(this.height * 0.5)
    let subDepth: number = Math.floor(this.depth * 0.5)

    for (let i: number = 0; i < 8; i++) {
      let offsetX: number = (i % 2) * subWidth
      let offsetY: number = Math.floor((i % 4) / 2) * subHeight
      let offsetZ: number = Math.floor(i / 4) * subDepth

      let boundary: OctreeInterface = new Octree(
        subWidth, subHeight, subDepth,
        this.x + offsetX, this.y + offsetY, this.z + offsetZ,
        this.capacity
      )
      this.boundaries.push(boundary)
    }

    let oldPoints = this.points
    this.points = []
    for (let point of oldPoints)
      this.insert(point)
  }
  private averagePoints(points: Array<DataPoint>): DataPoint {
    if (points.length === 0) return {
      x: 0, y: 0, z: 0,
      data: 0
    } satisfies DataPoint

    let sumX: number = 0
    let sumY: number = 0
    let sumZ: number = 0
    for (let point of points) {
      sumX += point.x
      sumY += point.y
      sumZ += point.z
    }

    return {
      x: sumX / points.length,
      y: sumY / points.length,
      z: sumZ / points.length,
      data: points.length
    } satisfies DataPoint
  }
  public flatten(node: OctreeInterface = this): Array<DataPoint> {
    let results: Array<DataPoint> = []

    if (node.points.length > 0)
      results.push(this.averagePoints(node.points))

    for (let boundary of node.boundaries)
      results.push(...this.flatten(boundary))

    return results
  }
}

export default Octree
