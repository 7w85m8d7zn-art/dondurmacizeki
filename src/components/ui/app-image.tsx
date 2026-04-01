import Image, { type ImageProps } from "next/image"

type AppImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string
  alt: string
}

const FALLBACK_IMAGE_DATA_URI =
  "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3e%3crect width='120' height='120' rx='20' fill='%23f5ede3'/%3e%3cpath d='M28 80 52 56a8 8 0 0 1 11 0l9 9 8-8a8 8 0 0 1 11 0l21 23H28Z' fill='%23d6b98f'/%3e%3ccircle cx='46' cy='42' r='9' fill='%23e7cfa7'/%3e%3c/svg%3e"

export function AppImage({ src, alt, ...props }: AppImageProps) {
  const normalizedSrc = src.trim().length > 0 ? src : FALLBACK_IMAGE_DATA_URI
  const isDataUrl = normalizedSrc.startsWith("data:")

  if (isDataUrl) {
    const {
      fill,
      className,
      style,
      width,
      height,
      priority,
      loading,
      placeholder: _placeholder,
      blurDataURL: _blurDataURL,
      loader: _loader,
      quality: _quality,
      unoptimized: _unoptimized,
      ...restProps
    } = props

    const imageLoading = priority ? "eager" : loading

    return (
      <img
        src={normalizedSrc}
        alt={alt}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        className={className}
        style={
          fill
            ? {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                ...style,
              }
            : style
        }
        loading={imageLoading}
        {...restProps}
      />
    )
  }

  return <Image src={normalizedSrc} alt={alt} unoptimized {...props} />
}
