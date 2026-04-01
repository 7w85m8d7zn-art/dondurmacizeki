import { buildDondurmaciMenu } from "@/data/dondurmaci-menu"
import type { Menu } from "@/types/menu"

export function buildCizzReferenceMenu(
  _scope?: "karakopru",
  _menuId?: string,
): Menu {
  void _scope
  void _menuId
  return buildDondurmaciMenu()
}
