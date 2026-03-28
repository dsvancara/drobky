function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function productUrl(productId: number, name: string): string {
  return `https://www.rohlik.cz/${productId}-${slugify(name)}`
}