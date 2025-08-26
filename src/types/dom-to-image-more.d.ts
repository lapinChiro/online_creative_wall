declare module 'dom-to-image-more' {
  interface Options {
    filter?: (node: Node) => boolean
    bgcolor?: string
    width?: number
    height?: number
    style?: Partial<CSSStyleDeclaration>
    quality?: number
    cacheBust?: boolean
    imagePlaceholder?: string | undefined
    pixelRatio?: number
  }

  interface DomToImage {
    toPng(node: HTMLElement, options?: Options): Promise<string>
    toJpeg(node: HTMLElement, options?: Options): Promise<string>
    toBlob(node: HTMLElement, options?: Options): Promise<Blob>
    toPixelData(node: HTMLElement, options?: Options): Promise<Uint8ClampedArray>
    toSvg(node: HTMLElement, options?: Options): Promise<string>
  }

  const domtoimage: DomToImage
  export default domtoimage
}