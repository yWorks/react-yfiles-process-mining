import type { IRenderContext } from 'yfiles'

export class WebGLBufferData<T extends BufferSource> {
  private dirty = true
  private buffer: WebGLBuffer | null = null
  private readonly DataType: { new (size: number): T }
  data: T | null = null
  private attributeLocation: GLuint = -1

  constructor(
    public entryCount: number,
    private readonly pointerType: GLenum,
    private readonly attributeName: string,
    private readonly elementSize: GLint,
    dataType: { new (size: number): T }
  ) {
    this.DataType = dataType
  }

  init(gl: WebGLRenderingContext, program: WebGLProgram): void {
    this.dirty = true
    this.buffer = gl.createBuffer()
    this.data = new this.DataType(this.elementSize * this.entryCount)
    this.attributeLocation = gl.getAttribLocation(program, this.attributeName)
  }

  updateData(): void {
    this.dirty = true
  }

  enableRendering(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    if (this.dirty) {
      gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW)
      this.dirty = false
    }
    gl.enableVertexAttribArray(this.attributeLocation)
    gl.vertexAttribPointer(this.attributeLocation, this.elementSize, this.pointerType, false, 0, 0)
  }

  disableRendering(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    gl.disableVertexAttribArray(this.attributeLocation)
  }

  dispose(gl: WebGLRenderingContext, program: WebGLProgram): void {
    gl.deleteBuffer(this.buffer)
    gl.deleteProgram(program)
    this.data = null
    this.entryCount = 0
    this.attributeLocation = -1
  }
}

export class WebGLProgramInfo {
  private readonly buffers: WebGLBufferData<never>[]

  constructor(protected entryCount: number) {
    this.buffers = []
  }

  createFloatBuffer(attributeName: string, entrySize = 1): WebGLBufferData<Float32Array> {
    const bufferData = new WebGLBufferData(
      this.entryCount,
      WebGLRenderingContext.prototype.FLOAT,
      attributeName,
      entrySize,
      Float32Array
    ) as WebGLBufferData<never>
    this.buffers.push(bufferData)
    return bufferData
  }

  init(gl: WebGLRenderingContext, program: WebGLProgram): void {
    for (const buffer of this.buffers) {
      buffer.init(gl, program)
    }
  }

  enableRendering(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    for (const buffer of this.buffers) {
      buffer.enableRendering(renderContext, gl)
    }
  }

  disableRendering(renderContext: IRenderContext, gl: WebGLRenderingContext): void {
    for (const buffer of this.buffers) {
      buffer.disableRendering(renderContext, gl)
    }
  }

  dispose(gl: WebGLRenderingContext, program: WebGLProgram): void {
    for (const buffer of this.buffers) {
      buffer.dispose(gl, program)
    }
  }
}
