import React from "react"
import { BaseBlockProps } from "./BaseBlockComponent"
import SharedBuildingBlock from "./SharedBuildingBlock"

export default function BuildingBlock(props: BaseBlockProps) {
  return <SharedBuildingBlock {...props} />
} 