import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { LabelChip } from '../../elements/LabelChip'
import type { LinkedItemCardProps } from './CardTypes'
import { CoverImage } from '../../elements/CoverImage'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import {
  AuthorInfoStyle,
  CardCheckbox,
  DescriptionStyle,
  LibraryItemMetadata,
  MetaStyle,
  siteName,
  TitleStyle,
  MenuStyle,
} from './LibraryCardStyles'
import { sortedLabels } from '../../../lib/labelsSort'
import { LibraryHoverActions } from './LibraryHoverActions'
import {
  useHover,
  useFloating,
  useInteractions,
  size,
  offset,
  autoUpdate,
} from '@floating-ui/react'
import { CardMenu } from '../CardMenu'
import { DotsThree } from 'phosphor-react'
import { isTouchScreenDevice } from '../../../lib/deviceType'

dayjs.extend(relativeTime)

type ProgressBarProps = {
  fillPercentage: number
  fillColor: string
  backgroundColor: string
  borderRadius: string
}

export function ProgressBar(props: ProgressBarProps): JSX.Element {
  return (
    <Box
      css={{
        height: '4px',
        width: '100%',
        borderRadius: '$1',
        overflow: 'hidden',
        backgroundColor: props.backgroundColor,
      }}
    >
      <Box
        css={{
          height: '100%',
          width: `${props.fillPercentage}%`,
          backgroundColor: props.fillColor,
          borderRadius: props.borderRadius,
        }}
      />
    </Box>
  )
}

export function LibraryGridCard(props: LinkedItemCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({
        mainAxis: -25,
      }),
      size(),
    ],
    placement: 'top-end',
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([hover])

  return (
    <VStack
      ref={refs.setReference}
      {...getReferenceProps()}
      css={{
        pl: '20px',
        padding: '15px',
        width: '320px',
        height: '100%',
        minHeight: '270px',
        background: 'white',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '$thBorderColor',
        cursor: 'pointer',
        '@media (max-width: 930px)': {
          m: '15px',
          width: 'calc(100% - 30px)',
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
      {props.inMultiSelect ? (
        <LibraryGridCardContent {...props} isHovered={isHovered} />
      ) : (
        <>
          {!isTouchScreenDevice() && (
            <Box
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <LibraryHoverActions
                item={props.item}
                viewer={props.viewer}
                handleAction={props.handleAction}
                isHovered={isHovered ?? false}
              />
            </Box>
          )}
          <Link
            href={`${props.viewer.profile.username}/${props.item.slug}`}
            passHref
          >
            <a
              href={`${props.viewer.profile.username}/${props.item.slug}`}
              style={{ textDecoration: 'unset', width: '100%', height: '100%' }}
              tabIndex={-1}
            >
              <LibraryGridCardContent {...props} isHovered={isHovered} />
            </a>
          </Link>
        </>
      )}
    </VStack>
  )
}

const LibraryGridCardContent = (props: LinkedItemCardProps): JSX.Element => {
  const { isChecked, setIsChecked, item } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const originText = siteName(props.item.originalArticleUrl, props.item.url)

  const handleCheckChanged = useCallback(() => {
    setIsChecked(item.id, !isChecked)
  }, [setIsChecked, isChecked])

  return (
    <>
      <HStack
        css={{
          ...MetaStyle,
          minHeight: '35px',
        }}
        distribution="start"
      >
        <LibraryItemMetadata item={props.item} />
        {props.inMultiSelect ? (
          <SpanBox css={{ marginLeft: 'auto' }}>
            <CardCheckbox
              isChecked={props.isChecked}
              handleChanged={handleCheckChanged}
            />
          </SpanBox>
        ) : (
          <Box
            css={{
              ...MenuStyle,
              visibility: menuOpen ? 'visible' : 'hidden',
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
        )}
      </HStack>

      <VStack
        alignment="start"
        distribution="start"
        css={{ height: '100%', width: '100%' }}
      >
        <Box
          css={{
            ...TitleStyle,
            height: '42px',
          }}
        >
          {props.item.title}
        </Box>
        <Box css={DescriptionStyle}>{props.item.description}</Box>
        <SpanBox
          css={{
            ...AuthorInfoStyle,
            mt: '10px',
          }}
        >
          {props.item.author}
          {props.item.author && originText && ' | '}
          <SpanBox css={{ textDecoration: 'underline' }}>{originText}</SpanBox>
        </SpanBox>
        <SpanBox
          css={{
            pt: '20px',
            pr: '10px',
            pb: '20px',
            width: '100%',
            m: '0px',
          }}
        >
          <ProgressBar
            fillPercentage={props.item.readingProgressPercent}
            fillColor="$thProgressFg"
            backgroundColor="$thBorderSubtle"
            borderRadius="5px"
          />
        </SpanBox>

        <HStack
          distribution="start"
          alignment="start"
          css={{ width: '100%', minHeight: '50px' }}
        >
          <HStack
            css={{
              display: 'block',
              minHeight: '35px',
            }}
          >
            {sortedLabels(props.item.labels).map(({ name, color }, index) => (
              <LabelChip key={index} text={name || ''} color={color} />
            ))}
          </HStack>
          <VStack
            css={{
              width: '80px',
              height: '100%',
              marginLeft: 'auto',
              flexGrow: '1',
            }}
            alignment="end"
            distribution="end"
          >
            {props.item.image && (
              <CoverImage
                src={props.item.image}
                alt="Link Preview Image"
                width={50}
                height={50}
                css={{ borderRadius: '8px' }}
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            )}
          </VStack>
        </HStack>
      </VStack>
    </>
  )
}
