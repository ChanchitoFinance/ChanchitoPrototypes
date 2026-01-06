'use client'

import { useMemo } from 'react'

interface AIPersonasRendererProps {
  content: string
  className?: string
}

interface PersonaConfig {
  key: string
  width: number
  height: number
}

const PERSONA_NAMES: Record<string, PersonaConfig> = {
  'AI · Technical Feasibility': { key: 'technical', width: 74, height: 76 },
  'AI · Founder Reality Check': { key: 'founder', width: 74, height: 80 },
  'AI · Market Skeptic': { key: 'market', width: 74, height: 72 },
  'AI · GTM & Distribution': { key: 'gtm', width: 74, height: 80 },
  'AI · Investor Lens': { key: 'investor', width: 72, height: 80 },
}

export function AIPersonasRenderer({
  content,
  className = '',
}: AIPersonasRendererProps) {
  const parsedContent = useMemo(() => {
    let html = content

    html = html.replace(/\r\n/g, '\n')

    html = html.replace(
      /\*\*\*(.*?)\*\*\*/g,
      '<strong class="font-bold"><em>$1</em></strong>'
    )

    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-text-primary">$1</strong>'
    )
    html = html.replace(
      /__(.*?)__/g,
      '<strong class="font-bold text-text-primary">$1</strong>'
    )

    html = html.replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>')
    html = html.replace(/_([^_\n]+)_/g, '<em class="italic">$1</em>')

    html = html.replace(
      /`([^`]+)`/g,
      '<code class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-accent">$1</code>'
    )

    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:text-accent/80 underline">$1</a>'
    )

    const lines = html.split('\n')
    const processed: string[] = []
    let currentPersona: string | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      let foundPersona = false
      for (const [personaName, personaConfig] of Object.entries(
        PERSONA_NAMES
      )) {
        if (trimmed.includes(`${personaName}:`)) {
          foundPersona = true
          currentPersona = personaConfig.key

          const contentAfterColon = trimmed.split(':').slice(1).join(':').trim()

          processed.push(
            `<div class="flex items-start gap-4 my-6">
              <div class="w-[${personaConfig.width}px] h-[${personaConfig.height}px] flex items-center justify-center bg-transparent flex-shrink-0">
                <img
                    src="/ai-personas/${personaConfig.key}.png"
                    alt="${personaName}"
                    class="max-w-full max-h-full"
                    style="width: ${personaConfig.width}px; height: ${personaConfig.height}px;"
                />
                </div>
              <div class="flex-1">
                <div class="font-semibold text-text-primary mb-2">${personaName}</div>
                ${contentAfterColon ? `<p class="text-text-secondary leading-relaxed">${contentAfterColon}</p>` : ''}
              </div>
            </div>`
          )
          break
        }
      }

      if (!foundPersona) {
        if (trimmed.startsWith('### ')) {
          processed.push(
            `<h3 class="text-lg font-semibold text-text-primary mt-4 mb-2">${trimmed.substring(4)}</h3>`
          )
        } else if (trimmed.startsWith('## ')) {
          processed.push(
            `<h2 class="text-xl font-semibold text-text-primary mt-5 mb-3">${trimmed.substring(3)}</h2>`
          )
        } else if (trimmed.startsWith('# ')) {
          processed.push(
            `<h1 class="text-2xl font-bold text-text-primary mt-6 mb-4">${trimmed.substring(2)}</h1>`
          )
        } else if (trimmed === '---' || trimmed === '***') {
          processed.push('<hr class="my-4 border-t border-border-color" />')
        } else if (/^[\-\*]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[\-\*]\s+/, '')
          processed.push(
            `<li class="ml-4 pl-2 flex mb-2"><span class="mr-2 flex-shrink-0">•</span><span class="flex-1 text-text-secondary">${content}</span></li>`
          )
        } else if (/^\d+\.\s+/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s+/, '')
          const itemNumber = trimmed.match(/^(\d+)\./)![1]
          processed.push(
            `<li class="ml-4 pl-2 flex mb-2"><span class="mr-2 flex-shrink-0 font-semibold">${itemNumber}.</span><span class="flex-1 text-text-secondary">${content}</span></li>`
          )
        } else if (trimmed === '') {
          if (
            processed.length > 0 &&
            !processed[processed.length - 1].includes('</div>')
          ) {
            processed.push('<div class="h-2"></div>')
          }
        } else {
          if (currentPersona && trimmed) {
            processed.push(
              `<p class="mb-3 text-text-secondary leading-relaxed ml-16">${trimmed}</p>`
            )
          } else {
            processed.push(
              `<p class="mb-3 text-text-secondary leading-relaxed">${trimmed}</p>`
            )
          }
        }
      }
    }

    return processed.join('')
  }, [content])

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  )
}
