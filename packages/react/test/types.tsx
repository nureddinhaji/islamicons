// Type-checked by `tsc -p test` (bundler resolution) and `tsc -p test/tsconfig.nodenext.json`; never run.
import {type IconProps, Mosque} from '@islamicons/react'
import MosqueFile from '@islamicons/react/icons/mosque'
import {createRef} from 'react'

const ref = createRef<SVGSVGElement>()

export const _guide = (
    <Mosque
        size={32}
        color="#1f6b55"
        strokeWidth={1.4}
        absoluteStrokeWidth
        className="text-amber-700"
        aria-label="مسجد"
        data-icon="mosque"
        ref={ref}
    />
)
export const _css_size = <MosqueFile size="2rem" />
export const _shared: IconProps = {size: 24, onClick: () => {}}

// @ts-expect-error strokeWidth is a number
export const _wrong_type = <Mosque strokeWidth="thick" />

// @ts-expect-error no such prop
export const _unknown = <Mosque thickness={2} />
