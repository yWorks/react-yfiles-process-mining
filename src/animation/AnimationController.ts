import { Animator, GraphComponent } from 'yfiles'

/**
 * This controller manages the animation of the heatmap and transition events.
 * It handles the state of the animation and updates the progress via a callback function.
 */
export class AnimationController {
  animator: Animator
  running: boolean

  /**
   * Creates a new Animation controller.
   * @param graphComponent the graph component to which the animation belongs
   */
  constructor(public graphComponent: GraphComponent) {
    this.running = false
    this.animator = new Animator({
      canvas: graphComponent,
      allowUserInteraction: true,
      autoInvalidation: true
    })
  }

  /**
   * Starts the animation.
   * @param progressCallback a callback function to report the progress back
   * @param maxTime the maximum time that the animation can take
   */
  async runAnimation(progressCallback: (value: number) => void, maxTime: number): Promise<void> {
    if (!this.running) {
      await this.animator.animate(progressCallback, maxTime)
      this.running = false
    }
  }

  /**
   * Starts the animation.
   * @param progressCallback a callback function to report the progress back
   * @param duration the maximum time that the animation can take
   */
  async startAnimation(progressCallback: (value: number) => void, duration: number): Promise<void> {
    if (this.animator) {
      this.animator.stop()
      this.animator.paused = false
    }
    this.running = false
    await this.runAnimation(progressCallback, duration)
  }

  /**
   * Stops the animation.
   */
  stopAnimation(): void {
    if (this.animator) {
      this.animator.stop()
      this.animator.paused = false
    }
  }
}
