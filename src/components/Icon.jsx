import { forwardRef, useState, useEffect } from 'react'
import classNames from 'classnames'

// import.meta.glob con eager: false → lazy loading por icono (no explota el bundle)
const iconsGlob = import.meta.glob('../assets/icons/**/*.svg', {
  query: '?react',
  import: 'default',
})

// Mapeo de variante → carpeta
const variantFolderMap = {
  thin:    'classics/thin',
  light:   'classics/light',
  regular: 'classics/regular',
  solid:   'classics/solid',
  flat:    'brands/flat',
  color:   'brands/color',
}

const preloadCache = new Map()

export function preloadIcon(name, variant = 'regular') {
  if (!name) return Promise.resolve(false)

  const folder = variantFolderMap[variant] ?? `classics/${variant}`
  const key = `../assets/icons/${folder}/${name}.svg`
  const loader = iconsGlob[key]
  if (!loader) return Promise.resolve(false)

  const cached = preloadCache.get(key)
  if (cached) return cached

  const promise = loader()
    .then(() => true)
    .catch(() => false)

  preloadCache.set(key, promise)
  return promise
}

// Tamaños predefinidos (Tailwind)
const sizeMap = {
  xxxs: 'w-2 h-2',
  xxs:  'w-2.5 h-2.5',
  xs:   'w-3 h-3',
  sm:   'w-4 h-4',
  md:   'w-5 h-5',
  lg:   'w-6 h-6',
  xl:   'w-7 h-7',
  '2xl': 'w-8 h-8',
  '3xl': 'w-9 h-9',
}

const Icon = forwardRef(
  (
    {
      name,
      variant  = 'regular',
      size     = 'md',
      color    = '',        // ej: "text-slate-800", "text-yellow-500"
      animation= '',        // ej: "animate-spin"
      className= '',
      title    = '',
      forceColor = false,
      ...props
    },
    ref
  ) => {
    const [SvgComponent, setSvgComponent] = useState(null)

    useEffect(() => {
      if (!name) return

      const folder = variantFolderMap[variant] ?? `classics/${variant}`
      const key    = `../assets/icons/${folder}/${name}.svg`
      const loader = iconsGlob[key]

      if (loader) {
        loader().then(mod => setSvgComponent(() => mod)).catch(() => setSvgComponent(null))
      } else {
        setSvgComponent(null)
      }
    }, [name, variant])

    const sizeClass = sizeMap[size] ?? '' // si no es un token, se puede pasar en className
    const classes   = classNames(
      'inline-flex items-center justify-center select-none',
      sizeClass,
      color,
      animation,
      className,
    )

    const isMultiColor = ['color', 'flat'].includes(variant)
    const svgClasses   = classNames('w-full h-full', { 'fill-current': !isMultiColor || forceColor })

    return (
      <span ref={ref} className={classes} title={title} data-icon={name} {...props}>
        {SvgComponent
          ? <SvgComponent className={svgClasses} aria-hidden="true" />
          : null
        }
      </span>
    )
  }
)

Icon.displayName = 'Icon'
export default Icon
