declare module '*.png' {
  import { StaticImageData } from 'next/image'
  const content: StaticImageData
  export default content
}

declare module '*.jpg' {
  import { StaticImageData } from 'next/image'
  const content: StaticImageData
  export default content
}

declare module '*.jpeg' {
  import { StaticImageData } from 'next/image'
  const content: StaticImageData
  export default content
}

declare module '*.svg' {
  const content: any
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}
