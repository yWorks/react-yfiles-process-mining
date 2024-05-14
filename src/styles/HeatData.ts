/**
 * A data object that contains a history of heat data for one process step.
 */
export class HeatData {
  private readonly values: Float32Array
  private readonly minTime: number
  private readonly maxTime: number

  constructor(elements = 64, minTime = 0, maxTime = 1) {
    this.values = new Float32Array(elements)
    this.minTime = minTime
    this.maxTime = maxTime
  }

  /**
   * Returns the heat value at a specific timestamp.
   */
  public getValue(timestamp: number): number {
    if (timestamp < this.minTime || timestamp >= this.maxTime) {
      return 0
    } else {
      const ratio = this.calculateRatio(timestamp)
      const index = Math.floor(ratio)
      const fraction = ratio - index
      if (index + 1 < this.values.length) {
        return this.values[index] * (1 - fraction) + this.values[index + 1] * fraction
      } else {
        return this.values[index]
      }
    }
  }

  /**
   * Adds the given value for a given time span. This is used internally to set up the heat data.
   */
  addValues(from: number, to: number, value: number): void {
    const fromRatio = this.calculateRatio(from)
    const fromIndex = Math.floor(fromRatio)
    const fromFraction = fromRatio - fromIndex
    const toRatio = this.calculateRatio(to)
    const toIndex = Math.floor(toRatio)
    const toFraction = toRatio - toIndex

    this.values[fromIndex] += (1 - fromFraction) * value
    for (let i = fromIndex + 1; i < toIndex; i++) {
      this.values[i] += value
    }
    this.values[toIndex] += value * toFraction
  }

  /**
   * Calculates the ratio of the given time in relation to the time span
   * covered by this {@link HeatData}.
   */
  private calculateRatio(time: number): number {
    return ((time - this.minTime) / (this.maxTime - this.minTime)) * this.values.length
  }

  /**
   * Returns the maximum heat value over the whole time span that is covered by this {@link HeatData}.
   */
  public getMaxValue(): number {
    return this.values.reduce((maxValue, value) => Math.max(maxValue, value), 0)
  }
}
