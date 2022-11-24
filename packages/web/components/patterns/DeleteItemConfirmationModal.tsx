import {
  ModalRoot,
  ModalContent,
  ModalOverlay,
} from '../elements/ModalPrimitives'
import { VStack, HStack } from '../elements/LayoutPrimitives'
import { Button } from '../elements/Button'
import { StyledText } from '../elements/StyledText'
import { useConfirmListener } from '../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { useEffect, useRef } from 'react'

type ConfirmationModalProps = {
  message?: string
  richMessage?: React.ReactNode
  icon?: React.ReactNode
  acceptButtonLabel?: string
  onAccept: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteItemConfirmationModal(
  props: ConfirmationModalProps
): JSX.Element {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent css={{ bg: '$grayBg', maxWidth: '20em' }}>
        <VStack alignment="center" distribution="end" css={{ p: '$2' }}>
          {props.icon ? props.icon : null}
          {props.richMessage ? (
            props.richMessage
          ) : (
            <StyledText>{props.message}</StyledText>
          )}
          <HStack distribution="end" css={{ pt: '$2' }}>
            <Button
              style="ctaOutlineYellow"
              css={{ mr: '$2' }}
              onClick={() => props.onOpenChange(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  props.onOpenChange(false)
                }
              }}
            >
              Cancel
            </Button>
            <Button
              style="ctaDarkYellow"
              onClick={props.onAccept}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  props.onAccept()
                }
              }}
            >
              {props.acceptButtonLabel ?? 'Confirm'}
            </Button>
          </HStack>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}
