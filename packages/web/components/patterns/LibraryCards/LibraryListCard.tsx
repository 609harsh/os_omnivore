import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { useState } from 'react'
import { DotsThree } from 'phosphor-react'
import Link from 'next/link'
import { CardMenu } from '../CardMenu'
import {
  AuthorInfoStyle,
  MenuStyle,
  MetaStyle,
  siteName,
  timeAgo,
  TitleStyle,
} from './LibraryCardStyles'

export function LibraryListCard(props: LinkedItemCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const originText =
    props.item.siteName ||
    siteName(props.item.originalArticleUrl, props.item.url)

  return (
    <VStack
      css={{
        p: '20px',
        height: '100%',
        cursor: 'pointer',
        gap: '10px',
        border: '1px solid $grayBorder',
        borderBottom: 'none',
        width: '900px',

        '@xxl': {
          width: '1200px',
        },

        '@xlgDown': {
          width: 'unset',
          borderRadius: 'unset',
          borderLeft: 'unset',
          borderRight: 'unset',
        },
      }}
      alignment="start"
      distribution="start"
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
    >
      <Link
        href={`${props.viewer.profile.username}/${props.item.slug}`}
        passHref
      >
        <a
          href={`${props.viewer.profile.username}/${props.item.slug}`}
          style={{ textDecoration: 'unset', width: '100%', height: '100%' }}
        >
          <HStack css={MetaStyle} distribution="start">
            <Box>
              {timeAgo(props.item.savedAt)}
              {` `}
              {props.item.wordsCount ?? 0 > 0
                ? `  • ${Math.max(
                    1,
                    Math.round((props.item.wordsCount ?? 0) / 235)
                  )} min read`
                : null}
              {props.item.readingProgressPercent ?? 0 > 0 ? (
                <>
                  {`  • `}
                  <SpanBox css={{ color: '#55B938' }}>
                    {`${Math.round(props.item.readingProgressPercent)}%`}
                  </SpanBox>
                </>
              ) : null}
              {props.item.highlights?.length ?? 0 > 0
                ? `  • ${props.item.highlights?.length} highlights`
                : null}
            </Box>
            <Box
              css={{
                ...MenuStyle,
                visibility: isHovered || menuOpen ? 'unset' : 'hidden',
                '@media (hover: none)': {
                  visibility: 'unset',
                },
              }}
            >
              <CardMenu
                item={props.item}
                viewer={props.viewer}
                onOpenChange={(open) => setMenuOpen(open)}
                actionHandler={props.handleAction}
                triggerElement={
                  <DotsThree size={25} weight="bold" color="#ADADAD" />
                }
              />
            </Box>
          </HStack>
          <VStack
            alignment="start"
            distribution="start"
            css={{ height: '100%', width: '100%' }}
          >
            <Box css={{ ...TitleStyle, width: '80%' }}>{props.item.title}</Box>
            <SpanBox
              css={{
                mt: '5px',
                ...AuthorInfoStyle,
              }}
            >
              {props.item.author}
              {props.item.author && originText && ' | '}
              <SpanBox css={{ textDecoration: 'underline' }}>
                {originText}
              </SpanBox>
            </SpanBox>

            <HStack
              distribution="start"
              alignment="start"
              // The two pixels here are to account for the label margin
              css={{ width: '100%', ml: '-2px', mt: '5px' }}
            >
              <HStack
                css={{
                  display: 'block',
                }}
              >
                {props.item.labels?.map(({ name, color }, index) => (
                  <LabelChip key={index} text={name || ''} color={color} />
                ))}
              </HStack>
            </HStack>
          </VStack>
        </a>
      </Link>
    </VStack>
  )
}
