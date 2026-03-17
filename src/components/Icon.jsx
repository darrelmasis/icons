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
  world:   'brands/world',
  local:   'brands/local',
  flat:    'brands/local/flat',
  color:   'brands/local/color',
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

    const isMultiColor = ['world', 'color', 'flat'].includes(variant)
    const svgClasses   = classNames('w-full h-full', { 'fill-current': !isMultiColor })

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
