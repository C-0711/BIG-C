# Product Description Generator

Generate compelling, SEO-optimized product descriptions from raw data.

## Capabilities
- Short descriptions (1-2 sentences)
- Long descriptions (full paragraphs)
- Bullet point features
- SEO meta titles & descriptions
- Multi-language support

## Input
- product_name: string
- category: string
- features: array
- specifications: object
- target_audience?: string
- tone?: "professional" | "casual" | "technical"
- language?: string (default: "de")

## Output
- description_short: string
- description_long: string
- bullet_points: string[]
- meta_title: string
- meta_description: string
- keywords: string[]
