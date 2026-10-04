import type { Ontogeny } from '../types'
import { graph as mouseEmbryo } from './mouse-embryo'
import { graph as hematopoiesis } from './hematopoiesis'
import { graph as humanEmbryo } from './human-embryo'
import { graph as cElegans } from './c-elegans'

export const ONTOGENIES: Ontogeny[] = [mouseEmbryo, hematopoiesis, humanEmbryo, cElegans]

export function findOntogeny(id: string): Ontogeny | undefined {
  return ONTOGENIES.find((g) => g.id === id)
}
