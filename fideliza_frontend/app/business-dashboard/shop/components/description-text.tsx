'use client'

import { useState } from 'react'

interface DescriptionTextProps {
  text: string
}

export function DescriptionText({ text }: DescriptionTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <p className="
      text-[18px]          
      md:text-[20px]       
      leading-[24px]       
      md:leading-[26px]    
      font-['Open_Sans'] 
      font-semibold 
      text-justify
      mt-1
      relative
    ">
      <span className={`
        block
        ${!isExpanded ? 'line-clamp-3' : ''}
        md:line-clamp-none
      `}>
        {!isExpanded ? (
          <>
            <span className="md:hidden">{text.slice(0, 99)}</span>
            <span className="hidden md:inline">{text}</span>
          </>
        ) : text}
        {!isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="
              
              md:hidden
              inline-flex
              font-bold
              underline
              decoration-solid
            "
          >
            ...See more
          </button>
        )}
      </span>
      {isExpanded && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="
            ml-1
            md:hidden
            inline-flex
            font-bold
            underline
            decoration-solid
          "
        >
          See less
        </button>
      )}
    </p>
  )
}