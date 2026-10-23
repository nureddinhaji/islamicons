export function download_blob(blob, file_name) {
    const url = URL.createObjectURL(blob)
    const anchor = Object.assign(document.createElement('a'), {href: url, download: file_name})
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function download_svg(svg, file_name) {
    download_blob(new Blob([svg], {type: 'image/svg+xml'}), file_name)
}

export async function download_png(svg, file_name, size) {
    const image = new Image(size, size)
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    await image.decode()
    const canvas = Object.assign(document.createElement('canvas'), {width: size, height: size})
    canvas.getContext('2d').drawImage(image, 0, 0, size, size)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    download_blob(blob, file_name)
}
